import { useCallback, useRef, useState, useEffect } from 'react';
import { Grid, GridColumn as Column, GridNoRecords, GridToolbar } from '@progress/kendo-react-grid';
import { connect } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';
// prettier-ignore
import {
  ORDER_STATUS_CONFIG, getPagePermission, MSG_NO_DATA,
  DATETIME_PICKER_DEFAULT_PLACEHODLER, PAGING_CONFIG,
  PAYMENT_METHOD, CUSTOMER_TYPE_MAP, USER_GROUP_STORE
} from 'app/constants';
import { Tooltip, Link } from '@material-ui/core';
import LoadingPanel from 'app/kendo/LoadingPanel';
// prettier-ignore
import {
  NumberFilterCell, DropdownFilterCell,
  DateFilterCell, GridToolbarCustom, CustomPaging,
} from 'app/kendo/CustomCell';
import { openDialog, closeDialog } from 'app/store/fuse/dialogSlice';
import { withRouter } from 'react-router';
import axios from 'app/axios';
import { DateRangePicker } from '@progress/kendo-react-dateinputs';
import { convertUnixTime, initDataState, parseUrlParams, formatCurrency, processDataStateToUrlParams, changeUrlParamByDataState } from 'app/helper/general.helper';
import { showErrorMessage, showSuccessMessage } from 'app/store/fuse/messageSlice';
import { CustomerInput } from 'app/kendo/CustomerInput';
import { useSelector } from 'react-redux';
import { useKeyListener } from 'app/shared-components/KeyListener';
import { startOfDay, endOfDay, getUnixTime } from 'date-fns';

const optionsOrderStatus = Object.values(ORDER_STATUS_CONFIG);

const filterOperators = {
  date: [
    {
      text: 'grid.filterEqOperator',
      operator: 'eq',
    },
  ],
};
const moduleName = 'pbs';
const filterTypeList = {
  _id: 'number',
  customer_id: 'number',
  status: 'number',
  created_date: 'date',
  from_date: 'date',
  to_date: 'date',
  store_id: 'number',
};
const defaultParams = {
  tab: 3,
};

function PBSAccountStatusGrid(props) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  let total = useRef(0);

  const query = parseUrlParams(props.location.search);
  const [dataState, setDataState] = useState(initDataState(query, filterTypeList, moduleName));
  const storeList = useSelector(({ fuse }) => fuse.cache.storeList);
  const [value, setValue] = useState({
    start: dataState.filter?.filters?.find(e => e.field === 'from_date')?.value ?? null,
    end: dataState.filter?.filters?.find(e => e.field === 'to_date')?.value ?? null,
  });

  useEffect(() => {
    let newDataState = initDataState(query, filterTypeList, moduleName);
    setDataState(newDataState);
    getDataList(newDataState);
  }, [props.location]);


  const getDataList = (tmpDataState = dataState) => {
    let params = {
      limit: tmpDataState.take,
      ...processDataStateToUrlParams(tmpDataState, {}, true),
    };
    if (params.from_date) {
      params['from_date'] = getUnixTime(startOfDay(params.from_date));
    }
    if (params.to_date) {
      let date = endOfDay(params.to_date);
      params['to_date'] = getUnixTime(endOfDay(params.to_date));
    }
    if (params.created_date) {
      params['from_date'] = getUnixTime(startOfDay(params.created_date));
      params['to_date'] = getUnixTime(endOfDay(params.created_date));
      delete params.created_date;
    }
    setLoading(true);
    axios.get(`/orders`, {
      params: {
        ...params,
        payment_method: 'PBS'
      }
    })
      .then(({ data }) => {
        if (data.data.total) {
          total.current = data.data.total;
        }
        setData(data.data.order_list);
        setLoading(false);
      }).catch(e => {
        setLoading(false);
      });
  };

  useKeyListener(1, getDataList);

  const StatusFilterCell = useCallback(propFilter => {
    return <DropdownFilterCell id="status-filter" {...propFilter} data={optionsOrderStatus} />;
  }, []);

  const StoreFilterCell = useCallback(propFilter => {
    return <DropdownFilterCell id="store-filter" {...propFilter} data={storeList} />;
  }, [storeList]);

  const [customer, setCustomer] = useState(null);

  const CustomerFilter = useCallback(propFilter => {
    return <CustomerInput autoFocus className='suggest-search' onChange={newCustomer => {
      setCustomer(newCustomer);
      if (newCustomer) {
        propFilter.onChange({ value: newCustomer._id, operator: 'eq' });
      } else {
        propFilter.onChange({
          value: '',
          operator: '',
        });
      }
    }} value={customer} customerType={CUSTOMER_TYPE_MAP.normal} />
  }, [customer]);

  const handleChangeRangePicker = e => {
    setValue(e.value);
    if (e.value.start && e.value.end) {
      submitChangeRangePicker(e.value);
    }
  };
  const submitChangeRangePicker = value => {
    let newDataState = {
      filter: {
        filters: [],
        logic: 'and',
      },
      ...dataState,
      skip: 0,
    };
    newDataState.filter.filters = dataState?.filter?.filters?.filter(e => !['created_date', '_id', 'from_date', 'to_date'].includes(e.field)) ?? [];
    if (value.start) {
      newDataState.filter.filters.push({
        field: 'from_date',
        operator: 'gte',
        value: value.start,
      });
    }
    if (value.end) {
      newDataState.filter.filters.push({
        field: 'to_date',
        operator: 'lte',
        value: value.end,
      });
    }
    console.log(newDataState)
    handleStateChange({ dataState: newDataState });
  };

  const handleStateChange = e => {
    if (e.dataState.filter?.filters.find(e => e.field === 'created_date')) {
      e.dataState.filter.filters = e.dataState.filter.filters.filter(e => !['from_date', 'to_date'].includes(e.field));
      setValue({ start: null, end: null });
    }

    changeUrlParamByDataState(props.history, moduleName, e.dataState, filterTypeList, defaultParams);
    if (e.dataState.take !== dataState.take) {
      setPagingConfig(moduleName, e.dataState.take);
    }
  };

  const hasValueRangePicker = value => {
    return value ? !!value.start || !!value.end : false;
  };

  return !data || !storeList ? (
    <LoadingPanel />
  ) : (<>
    {loading ? <LoadingPanel /> : null}
    <Grid
      style={{
        height: 'calc(100vh - 160px)',
      }}
      data={data}
      filterable
      pageable={PAGING_CONFIG}
      {...dataState}
      filterOperators={filterOperators}
      onDataStateChange={handleStateChange}
      total={total.current}
      pager={CustomPaging}>
      <GridToolbar>
        <GridToolbarCustom
          dataState={dataState}
          onClearChange={e => {
            handleStateChange(e);
            setValue({ start: null, end: null });
          }}
          leftComponent={
            <>
              <DateRangePicker
                value={value}
                onChange={handleChangeRangePicker}
                startDateInputSettings={{ label: 'Fra dato', formatPlaceholder: DATETIME_PICKER_DEFAULT_PLACEHODLER }}
                endDateInputSettings={{ label: 'Til dato', formatPlaceholder: DATETIME_PICKER_DEFAULT_PLACEHODLER }}
              />
              <button
                style={{ marginLeft: '8px', alignSelf: 'flex-end' }}
                className={`k-button k-button-icon ${hasValueRangePicker(value) ? 'k-clear-button-visible' : ''}`}
                title="Clear"
                disabled={!hasValueRangePicker(value)}
                onClick={() => {
                  const newValue = { start: null, end: null };
                  setValue(newValue);
                  handleChangeRangePicker({ value: newValue });
                }}>
                <span className="k-icon k-i-filter-clear" />
              </button>
            </>
          }
        />
      </GridToolbar>
      <GridNoRecords>{MSG_NO_DATA}</GridNoRecords>
      <Column width="100" field="_id" title="ID" filterCell={NumberFilterCell} />
      <Column
        field="customer_id"
        title="Kunde"
        filterCell={CustomerFilter}
        cell={({ dataItem }) => {
          let { customer_name } = dataItem;

          return (
            <td>
              <Link href={`/customer?id=${dataItem._id}`} target='_blank' rel='noopener'>{customer_name}</Link>
            </td>
          );
        }}
      />
      <Column
        width="150"
        field="payment_method"
        title="Betalingsmetode"
        filterable={false}
        cell={({ dataItem }) => (
          <td>
            {PAYMENT_METHOD[dataItem.payment_method]?.shortLabel ?? dataItem.payment_method}{' '}
            {PAYMENT_METHOD[dataItem.payment_method] === PAYMENT_METHOD.Card.value && dataItem.is_saved_card && dataItem.is_saved_card == false
              ? '(BM)'
              : ''}
          </td>
        )}
      />
      <Column
        width="200"
        field="status"
        title="Status"
        filterCell={StatusFilterCell}
        cell={({ dataItem }) => {
          const { status, status_note } = dataItem;
          return (
            <td>
              <Tooltip title={status_note ?? ''}>
                <span
                  style={{
                    border: `1px solid`,
                    padding: '4px',
                    borderRadius: '4px',
                    color: ORDER_STATUS_CONFIG[status].color,
                  }}>
                  {ORDER_STATUS_CONFIG[status].name}
                </span>
              </Tooltip>
            </td>
          );
        }}
      />
      <Column
        width="200"
        field="created_date"
        title="Dato"
        filterCell={DateFilterCell}
        filter="date"
        cell={({ dataItem }) => (
          <td style={{ textAlign: 'right' }}>
            <p>{convertUnixTime(dataItem.created_date)}</p>
            {dataItem.updated_date && <p>+ {convertUnixTime(dataItem.updated_date)}</p>}
            {dataItem.refund_date && <p>- {convertUnixTime(dataItem.refund_date)}</p>}
          </td>
        )}
      />
      {props.user.user_group_id !== USER_GROUP_STORE && (
        <Column field="store_id" title="Brugser" filterCell={StoreFilterCell} cell={({ dataItem }) => <td>{dataItem.store?.name}</td>} />
      )}
      <Column width="120" field="amount" title="Total" filterable={false} cell={({ dataItem }) => <td style={{ textAlign: 'right' }}>
        <p>{formatCurrency(dataItem.amount, true)}</p>
        {dataItem.amount_claim && <p>+ {formatCurrency(dataItem.amount_claim, true)}</p>}
        {dataItem.amount_refund && <p>- {formatCurrency(dataItem.amount_refund, true)}</p>}
      </td>} />
    </Grid>
  </>);
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      closeDialog,
      openDialog,
      showErrorMessage,
      showSuccessMessage
    },
    dispatch,
  );
}
function mapStateToProps({ auth }) {
  return {
    user: auth.user,
    pagePermission: getPagePermission('order', auth.user),
  };
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PBSAccountStatusGrid));

import { useCallback, useRef, useState, useEffect } from 'react';
import { Grid, GridColumn as Column, GridNoRecords, GridToolbar } from '@progress/kendo-react-grid';
import { connect, useSelector } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';
// prettier-ignore
import {
  ORDER_STATUS, ORDER_STATUS_CONFIG, getPagePermission, MSG_NO_DATA,
  DATETIME_PICKER_DEFAULT_PLACEHODLER, USER_GROUP_ADMIN, USER_GROUP_STAFF, USER_GROUP_STORE, PAGING_CONFIG,
  PAYMENT_METHOD, MSG_CAN_NOT_CHANGE_PAYMENT_METHOD, CUSTOMER_TYPE_MAP
} from 'app/constants';
import { AppBar, Toolbar, Icon, IconButton, Tooltip, Link } from '@material-ui/core';
import LoadingPanel from 'app/kendo/LoadingPanel';
// prettier-ignore
import {
  NumberFilterCell, DropdownFilterCell,
  DateFilterCell, GridToolbarCustom, CustomPaging,
} from 'app/kendo/CustomCell';
import { useGridScrollTop } from 'app/shared-components/KeyListener';
import { openDialog, closeDialog } from 'app/store/fuse/dialogSlice';
import { withRouter } from 'react-router';
// import TemplateOrderDetail from 'app/template/TemplateOrderDetail';
import PackingSlip from '../form/PackingSlip';
import useForceUpdate from '@fuse/hooks/useForceUpdate';
import axios from 'app/axios';
import { DateRangePicker } from '@progress/kendo-react-dateinputs';
import { convertUnixTime, formatCurrency } from 'app/helper/general.helper';
import ConfirmDialog from 'app/shared-components/ConfirmDialog';
import Notification from 'app/shared-components/Notification';
import { showErrorMessage, showSuccessMessage } from 'app/store/fuse/messageSlice';
import { CustomerInput } from 'app/kendo/CustomerInput';
import OrderClaimRefundForm from '../form/OrderClaimRefundForm';
import { withStyles } from '@material-ui/core/styles';

const optionsOrderStatus = Object.values(ORDER_STATUS_CONFIG);

const optionsPaymentMethod = Object.values(PAYMENT_METHOD);

const filterOperators = {
  date: [
    {
      text: 'grid.filterEqOperator',
      operator: 'eq',
    },
  ],
};

const StyledCloseButton = withStyles({
  root: {
    '&:hover': {
      color: 'yellow',
    },
  },
})(IconButton);

function OrderGrid(props) {
  const [forceUpdate] = useForceUpdate();
  const userList = useRef([]);
  const storeList = useSelector(({ fuse }) => fuse.cache.storeList);
  const settingList = useSelector(({ fuse }) => fuse.cache.settingList);
  const [value, setValue] = useState({
    start: props.dataState.filter?.filters?.find(e => e.field === 'from_date')?.value ?? null,
    end: props.dataState.filter?.filters?.find(e => e.field === 'to_date')?.value ?? null,
  });

  useGridScrollTop([props.dataState.skip]);

  useEffect(() => {
    axios
      .get(`/users`, {
        params: {
          field: '_id,name',
          user_group_id: [USER_GROUP_ADMIN, USER_GROUP_STAFF],
        },
      })
      .then(response => {
        const newData = response.data.data;
        userList.current = newData;
        forceUpdate();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const StatusFilterCell = useCallback(propFilter => {
    return <DropdownFilterCell id="status-filter" {...propFilter} data={optionsOrderStatus} />;
  }, []);

  const PaymentMethodFilterCell = useCallback(propFilter => {
    return <DropdownFilterCell id="paymentmethod-filter" textField="shortLabel" {...propFilter} data={optionsPaymentMethod} />;
  }, []);

  const StoreFilterCell = useCallback(
    propFilter => {
      return <DropdownFilterCell id="store-filter" {...propFilter} data={storeList} />;
    },
    [storeList],
  );

  const UserFilterCell = useCallback(propFilter => {
    return <DropdownFilterCell id="user-filter" {...propFilter} data={userList.current} />;
  }, []);

  const [customer, setCustomer] = useState(null);
  useEffect(() => {
    const customerFilter = props.dataState.filter.filters.find(x => x.field === 'customer_id');
    if (!customerFilter) {
      setCustomer(null);
    } else if (customerFilter.value !== customer?._id) {
      axios
        .get(`/customers/${customerFilter.value}`)
        .then(response => {
          setCustomer(response.data.data);
        })
        .catch(e => { });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.dataState.filter]);
  const CustomerFilter = useCallback(
    propFilter => {
      return (
        <CustomerInput
          autoFocus
          className="suggest-search"
          onChange={newCustomer => {
            setCustomer(newCustomer);
            if (newCustomer) {
              propFilter.onChange({ value: newCustomer._id, operator: 'eq' });
            } else {
              propFilter.onChange({
                value: '',
                operator: '',
              });
            }
          }}
          value={customer}
          customerType={CUSTOMER_TYPE_MAP.normal}
        />
      );
    },
    [customer],
  );
  const handleSubmitUpdatePaymentMethod = async order => {
    props.onUpdate(order, 'payment-method');
  };
  const handleUpdate = (dataItem, type = 'claim') => {
    let newDataItem = { ...dataItem };
    let onSubmit = props.onUpdate;
    switch (type) {
      case 'claim':
        if (![USER_GROUP_ADMIN, USER_GROUP_STORE].includes(props.user.user_group_id)) {
          return;
        }
        let extraPaymentTitle = settingList.find(x => x.key === 'extra_payment_title')?.value ?? null;
        if ([ORDER_STATUS.received, ORDER_STATUS.packed, ORDER_STATUS.packedPaymentIssue].includes(dataItem.status)) {
          let amountClaim = dataItem.amount;
          dataItem.product_list.forEach(product => {
            if (product.name === extraPaymentTitle) {
              amountClaim -= product.price;
            }
          });
          amountClaim = parseInt(amountClaim * 100) / 100;
          newDataItem = {
            ...dataItem,
            amount_claim: amountClaim,
            max_amount: dataItem.amount,
            status: ORDER_STATUS.packed,
          };
          if (dataItem.status === ORDER_STATUS.packed) {
            onSubmit = data => {
              props.onUpdate(data, 'claim-more');
            };
          } else {
            onSubmit = data => {
              props.onUpdate(data, 'claim');
            };
          }
        } else {
          return;
        }
        break;
      case 'refund':
        if (![USER_GROUP_ADMIN, USER_GROUP_STORE].includes(props.user.user_group_id)) {
          return;
        }
        if (dataItem.status === ORDER_STATUS.packed) {
          newDataItem = {
            amount_refund: dataItem.amount,
            ...dataItem,
          };
          onSubmit = data => {
            props.onUpdate(data, 'refund');
          };
        } else {
          return;
        }
        break;
      case 'payment_method':
        if (![USER_GROUP_ADMIN, USER_GROUP_STAFF].includes(props.user.user_group_id)) {
          return;
        }
        newDataItem = {
          ...dataItem,
          updated_card: false,
        };
        onSubmit = handleSubmitUpdatePaymentMethod;
        break;
      default:
        return;
    }
    props.openDialog({
      children: (
        <OrderClaimRefundForm
          pagePermission={props.pagePermission}
          dataItem={newDataItem}
          cancel={props.closeDialog}
          type={type}
          onSubmit={onSubmit}
          storeList={storeList}
        />
      ),
    });
  };

  const updateStatus = (dataItem, status) => {
    if ([USER_GROUP_ADMIN, USER_GROUP_STORE].includes(props.user.user_group_id)) {
      props.openDialog({
        children: (
          <ConfirmDialog
            title={`${status === ORDER_STATUS.canceled ? 'Annullere denne ordre?' : 'Tilbageføre denne ordre?'}`}
            handleYes={() => {
              props.onUpdate({
                ...dataItem,
                status,
              });
            }}
            handleNo={props.closeDialog}
          />
        ),
      });
    }
  };

  const handlePrint = dataItem => {
    props.openDialog({
      fullScreen: true,
      children: (
        <>
          <AppBar style={{ position: 'relative', height: 56 }}>
            <Toolbar>
              <StyledCloseButton edge="start" color="inherit" onClick={props.closeDialog} aria-label="close">
                <Icon>close</Icon>
              </StyledCloseButton>
            </Toolbar>
          </AppBar>
          <div>
            <PackingSlip
              style={{
                width: '100vw',
                height: 'calc(100vh - 56px)',
              }}
              dataItem={dataItem}
            />
            {/* <TemplateOrderDetail
              style={{
                width: '100vw',
                height: 'calc(100vh - 56px)',
              }}
              dataItem={dataItem}
            /> */}
          </div>
        </>
      ),
    });
  };

  const handleChangeRangePicker = e => {
    setValue(e.value);
    if (e.value.start && e.value.end) {
      submitChangeRangePicker(e.value);
    }
  };
  const submitChangeRangePicker = valueDate => {
    const newDataState = {
      filter: {
        filters: [],
        logic: 'and',
      },
      ...props.dataState,
      skip: 0,
    };
    newDataState.filter.filters = newDataState?.filter?.filters?.filter(e => !['created_date', '_id', 'from_date', 'to_date'].includes(e.field)) ?? [];
    if (valueDate.start) {
      newDataState.filter.filters.push({
        field: 'from_date',
        operator: 'gte',
        value: valueDate.start,
      });
    }
    if (valueDate.end) {
      newDataState.filter.filters.push({
        field: 'to_date',
        operator: 'lte',
        value: valueDate.end,
      });
    }
    props.onStateChange({ dataState: newDataState });
  };

  const handleStateChange = event => {
    if (event.dataState.filter?.filters.find(e => e.field === 'created_date')) {
      event.dataState.filter.filters = event.dataState.filter.filters.filter(e => !['from_date', 'to_date'].includes(e.field));
      setValue({ start: null, end: null });
    }
    props.onStateChange(event);
  };

  const hasValueRangePicker = newValue => {
    return newValue ? !!newValue.start || !!newValue.end : false;
  };

  const OrderStatus = ({ status }) => (
    <span
      style={{
        border: `1px solid`,
        padding: '4px',
        borderRadius: '4px',
        color: ORDER_STATUS_CONFIG[status].color,
      }}>
      {ORDER_STATUS_CONFIG[status].name}
    </span>
  );

  return !props.data || !storeList ? (
    <LoadingPanel />
  ) : (
    <>
      {props.loadingPanel ? <LoadingPanel /> : null}
      <Grid
        className="container-default"
        data={props.data}
        filterable
        pageable={PAGING_CONFIG}
        {...props.dataState}
        filterOperators={filterOperators}
        onDataStateChange={handleStateChange}
        total={props.total}
        pager={CustomPaging}>
        <GridToolbar>
          <GridToolbarCustom
            dataState={props.dataState}
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
                  type="button"
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
                <Notification openDialog={props.openDialog} closeDialog={props.closeDialog} showSuccessMessage={props.showSuccessMessage} />
              </>
            }
          />
        </GridToolbar>
        <GridNoRecords>{MSG_NO_DATA}</GridNoRecords>
        <Column
          width="100"
          field="_id"
          title="ID"
          filterCell={NumberFilterCell}
          cell={({ dataItem }) => {
            return (
              <td>
                <div className="text-center">
                  {dataItem.order_no}
                  <p style={{ fontSize: 11, color: 'secondary', marginTop: 5 }}>#{dataItem._id}</p>
                </div>
              </td>
            );
          }}
        />
        <Column
          field="customer_id"
          title="Kunde"
          filterCell={CustomerFilter}
          cell={({ dataItem }) => {
            const { customer_name: customerName } = dataItem;

            return [USER_GROUP_ADMIN, USER_GROUP_STAFF].includes(props.user.user_group_id) ? (
              <td>
                <Link href={`/customer?id=${dataItem.customer_id}`} target="_blank" rel="noopener">
                  {customerName}
                </Link>
              </td>
            ) : (
              <td>{customerName}</td>
            );
          }}
        />
        <Column
          width="150"
          field="payment_method"
          title="Betalingsmetode"
          filterCell={PaymentMethodFilterCell}
          cell={({ dataItem }) => (
            <td
              onDoubleClick={() => {
                if (dataItem.status === ORDER_STATUS.packed && dataItem.payment_method === PAYMENT_METHOD.Card.value) {
                  props.showErrorMessage(MSG_CAN_NOT_CHANGE_PAYMENT_METHOD);
                  return;
                }
                handleUpdate(dataItem, 'payment_method');
              }}>
              <div style={{ display: 'flex' }}>
                {PAYMENT_METHOD[dataItem.payment_method]?.shortLabel ?? dataItem.payment_method}
                {dataItem.payment_method === PAYMENT_METHOD.Card.value && dataItem.is_saved_card !== undefined && dataItem.is_saved_card === false ? (
                  <>
                    &nbsp;&nbsp;&nbsp;<Icon title="Ikke-gemt kort">info</Icon>
                  </>
                ) : (
                  ''
                )}
              </div>
            </td>
          )}
        />
        <Column
          width="200"
          field="status"
          title="Status"
          filterCell={StatusFilterCell}
          cell={({ dataItem }) => {
            const { status, status_note, card_to_pbs } = dataItem;
            if (ORDER_STATUS.packedPaymentIssue === status || (ORDER_STATUS.received === status && card_to_pbs)) {
              return (
                <td>
                  <Tooltip title={status_note ?? ''}>
                    <div>
                      <OrderStatus status={status} />
                    </div>
                  </Tooltip>
                </td>
              );
            }
            return (
              <td>
                <OrderStatus status={status} />
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
              {dataItem.claim_date && <p>+ {convertUnixTime(dataItem.claim_date)}</p>}
              {dataItem.refund_date && <p>- {convertUnixTime(dataItem.refund_date)}</p>}
            </td>
          )}
        />
        {props.user.user_group_id !== USER_GROUP_STORE && (
          <Column field="store_id" title="Brugser" filterCell={StoreFilterCell} cell={({ dataItem }) => <td>{dataItem.store?.name}</td>} />
        )}
        <Column
          field="order_by_id"
          title="Salgskonsulent"
          filterCell={UserFilterCell}
          cell={({ dataItem }) => (
            <td>
              {dataItem.order_by && (
                <Link href={`/user?id=${dataItem.order_by._id}`} target="_blank" rel="noopener">
                  {dataItem.order_by.name}
                </Link>
              )}
            </td>
          )}
        />
        <Column
          width="120"
          field="amount"
          title="Total"
          filterable={false}
          cell={({ dataItem }) => (
            <td onDoubleClick={() => handleUpdate(dataItem)} style={{ textAlign: 'right' }}>
              <p>{formatCurrency(dataItem.amount, true)}</p>
              {dataItem.amount_claim && (
                <p style={dataItem.amount_claim !== dataItem.amount ? { color: '#069f49' } : {}}>+ {formatCurrency(dataItem.amount_claim, true)}</p>
              )}
              {dataItem.amount_refund && <p>- {formatCurrency(dataItem.amount_refund, true)}</p>}
            </td>
          )}
        />
        <Column
          width="140"
          filterable={false}
          cell={({ dataItem }) => (
            <td>
              <IconButton title="Ordrevisning" size="small" onClick={() => props.onChangeTab(dataItem)}>
                <Icon>shopping_basket</Icon>
              </IconButton>
              <IconButton title="Pakkeseddel" size="small" onClick={() => handlePrint(dataItem)}>
                <Icon>print</Icon>
              </IconButton>
              <div style={{ width: '28px', display: 'inline-block' }}>
                {dataItem.payment_method === 'Card' && !dataItem.amount_refund && dataItem.status === ORDER_STATUS.packed && (
                  <IconButton title="Refunder" size="small" onClick={() => handleUpdate(dataItem, 'refund')}>
                    <Icon>reply</Icon>
                  </IconButton>
                )}
              </div>
              {dataItem.status === ORDER_STATUS.received && (
                <IconButton title="Annulleret" size="small" onClick={() => updateStatus(dataItem, ORDER_STATUS.canceled)}>
                  <Icon>block</Icon>
                </IconButton>
              )}
              {dataItem.status === ORDER_STATUS.canceled && (
                <IconButton title="Revert" size="small" onClick={() => updateStatus(dataItem, ORDER_STATUS.received)}>
                  <Icon>restore</Icon>
                </IconButton>
              )}
            </td>
          )}
        />
      </Grid>
    </>
  );
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      closeDialog,
      openDialog,
      showErrorMessage,
      showSuccessMessage,
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
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(OrderGrid));

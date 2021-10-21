import { useEffect, useState, useCallback } from 'react';
import axios from 'app/axios';
import { Grid, GridColumn as Column, GridToolbar, GridNoRecords } from '@progress/kendo-react-grid';
import { bindActionCreators } from '@reduxjs/toolkit';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
// prettier-ignore
import {
  ActiveCell, TextFilterCell, DropdownFilterCell,
  ActiveFilterCell, GridToolbarCustom, CustomPaging,
} from 'app/kendo/CustomCell';
import CustomerDetail from './form/CustomerDetail';
import { IconButton, Icon } from '@material-ui/core';
import { showMessage, showErrorMessage, showSuccessMessage } from 'app/store/fuse/messageSlice';
import { openDialog, closeDialog } from 'app/store/fuse/dialogSlice';
import LoadingPanel from 'app/kendo/LoadingPanel';
import { getPagePermission, CUSTOMER_TYPE_MAP, USER_GROUP_ADMIN, MSG_NO_DATA, PAGING_CONFIG, PLACEHOLDER_CUSTOMER } from 'app/constants';
import ChangePasswordForm from './form/ChangePasswordForm';
import LoginSettingForm from './form/LoginSettingForm';
import CustomerWalletForm from './form/CustomerWalletForm';
import { initDataState, processFilterToParams, changeUrlParamByDataState } from 'app/helper/general.helper';
import { useSelector } from 'react-redux';
import { useKeyListener, useGridScrollTop } from 'app/shared-components/KeyListener';
let defaultPBSSetting, total;

const moduleName = 'customer';
const filterTypeList = {
  name: 'text',
  store_id: 'number',
  type: 'text',
  active: 'boolean',
}

const CustomerList = props => {
  const [data, setData] = useState(null);
  const [dataState, setDataState] = useState(initDataState(props.query, filterTypeList, moduleName));
  const storeList = useSelector(({ fuse }) => fuse.cache.storeList);

  const getData = (tmpDataState = dataState) => {
    let params = { limit: tmpDataState.take };
    params = processFilterToParams(tmpDataState.filter, params);
    params.page = 1 + tmpDataState.skip / tmpDataState.take;
    axios
      .get(`/customers`, { params })
      .then(response => {
        const newData = response.data.data;
        total = newData.total ?? total;

        setData(newData.customer_list);
      })
      .catch(error => {
        props.showErrorMessage();
      });
  };

  const initData = () => {
    (async () => {
      await axios
        .get(`/settings/pbs_settings`)
        .then(response => {
          defaultPBSSetting = response.data.data ?? {};
        })
        .catch(error => {
          defaultPBSSetting = {};
        });
      getData();
    })();
  };
  useKeyListener(1, initData);
  useGridScrollTop([dataState.skip]);

  useEffect(() => {
    let newDataState = initDataState(props.query, filterTypeList, moduleName);
    setDataState(newDataState);

    getData(newDataState);
  }, [props.location]);

  useEffect(() => {
    initData();

    return () => {
      defaultPBSSetting = null;
    };
  }, []);

  // const update = dataItem => {
  //   if (!props.pagePermission.update) {
  //     return;
  //   }
  //   delete dataItem.customer_list;
  //   delete dataItem.manage_by;
  //   delete dataItem.username;
  //   delete dataItem.password;

  //   axios
  //     .put(`/customers/${dataItem._id}`, dataItem)
  //     .then(response => {
  //       props.showSuccessMessage();
  //       props.closeDialog();
  //     })
  //     .catch(error => { });
  // };

  const updateLoginInfo = dataItem => {
    if (!props.pagePermission.update && props.user.user_group_id == USER_GROUP_ADMIN) {
      return;
    }

    axios.put(`/customers/${dataItem._id}/special`, dataItem).then(response => {
      let newData = data.map(x => {
        let newItem = x;
        if (x._id == dataItem._id) {
          newItem = response.data.data;
        }
        delete newItem.password;
        return newItem;
      });
      setData(newData);
      props.showSuccessMessage();
      props.closeDialog();
    });
  };

  const updateWallet = dataItem => {
    if (!props.pagePermission.update && props.user.user_group_id == USER_GROUP_ADMIN) {
      return;
    }
    axios.put(`/customers/${dataItem._id}/wallet`, dataItem).then(response => {
      let newData = data.map(x => {
        let newItem = x;
        if (x._id == dataItem._id) {
          newItem = {
            ...x,
            ...response.data.data,
          };
        }
        delete newItem.password;
        return newItem;
      });
      setData(newData);
      props.showSuccessMessage();
      props.closeDialog();
    });
  };

  const add = dataItem => {
    if (!props.pagePermission.insert) {
      return;
    }

    axios
      .post(`/customers`, dataItem)
      .then(response => {
        let newCustomerList = data;
        newCustomerList.unshift(response.data.data);
        setData(newCustomerList);

        props.showSuccessMessage();
        props.closeDialog();
      })
      .catch(error => { });
  };

  const handleAdd = () => {
    props.openDialog({
      maxWidth: '1200px',
      children: (
        <CustomerDetail
          cancel={props.closeDialog}
          onSubmit={add}
          item={{ phone: [], type: 1, credit_limit: defaultPBSSetting.value.credit_limit.value, active: true }}
        />
      ),
    });
  };

  const handleUpdate = propsCell => {
    if (!props.pagePermission.update) {
      return;
    }

    props.history.push({
      pathname: `/customer`,
      search: `?id=${propsCell.dataItem._id}`,
    });
  };

  const changePassword = customer => {
    props.openDialog({
      children: (
        <ChangePasswordForm
          closeDialog={props.closeDialog}
          customer={customer}
          onSubmit={data => {
            updateLoginInfo({ _id: customer._id, password: data.password, username: data.username });
          }}
        />
      ),
    });
  };

  const changeLoginSetting = customer => {
    props.openDialog({
      children: (
        <LoginSettingForm
          closeDialog={props.closeDialog}
          customer={customer}
          onSubmit={data => {
            updateLoginInfo(data);
          }}
        />
      ),
    });
  };

  const handleUpdateWallet = customer => {
    props.openDialog({
      maxWidth: '1200px',
      children: (
        <CustomerWalletForm
          closeDialog={props.closeDialog}
          customer={customer}
          onSubmit={data => {
            updateWallet(data);
          }}
          showErrorMessage={props.showErrorMessage}
          showSuccessMessage={props.showSuccessMessage}
        />
      ),
    });
  };

  const typeList = [
    {
      _id: 1,
      name: 'Visitation',
    },
    {
      _id: 2,
      name: 'MiniAdmin',
    },
  ];

  const TypeFilterCell = useCallback(propFilter => {
    return <DropdownFilterCell id="type-filter" {...propFilter} data={typeList} />;
  }, []);
  const StoreFilterCell = useCallback(
    propFilter => {
      return <DropdownFilterCell id="store-filter" {...propFilter} data={storeList} />;
    },
    [storeList],
  );

  const onDataStateChange = e => {
    changeUrlParamByDataState(props.history, moduleName, e.dataState);
    if (e.dataState.take !== dataState.take) {
      setPagingConfig(moduleName, e.dataState.take);
    };
  };

  const NameFilter = useCallback(propsFilter => <TextFilterCell {...propsFilter} placeholder={PLACEHOLDER_CUSTOMER} />, []);
  if (props.query.id) {
    return <CustomerDetail customerList={data} setCustomerList={setData} editId={+props.query.id} customerList={data} setCustomerList={setData} />;
  }

  return !data || !storeList ? (
    <LoadingPanel />
  ) : (
    <Grid
      style={{
        height: 'calc(100vh - 165px)',
      }}
      pageable={PAGING_CONFIG}
      total={total}
      {...dataState}
      onDataStateChange={onDataStateChange}
      filterable
      data={data}
      pager={CustomPaging}
      sortable
      onRowDoubleClick={propsCell => handleUpdate(propsCell)}>
      <GridToolbar>
        <GridToolbarCustom dataState={dataState} onClearChange={onDataStateChange} insert={props.pagePermission.insert} handleAdd={handleAdd} />
      </GridToolbar>
      <Column field="_id" title="ID" width="90" filterable={false} />
      <Column
        field="name"
        title="Navn"
        filterCell={NameFilter}
        cell={propsCell => (
          <td onDoubleClick={() => handleUpdate(propsCell)}>
            <p>{propsCell.dataItem.name}</p>
            {propsCell.dataItem.type === CUSTOMER_TYPE_MAP.normal && (
              <div style={{ fontSize: 11, marginTop: 5 }}>
                <p>{propsCell.dataItem.address ?? ''}</p>
                <p>
                  {propsCell.dataItem.zip_code?.zip_code ?? ''}, {propsCell.dataItem.zip_code?.city_name ?? ''}
                </p>
              </div>
            )}
          </td>
        )}
      />
      <Column field="username" title="Brugernavn" width="250" filterable={false} />
      <Column field="phone" title="Telefon" width="200" filterable={false} />
      <Column
        field="store_id"
        title="Butik"
        width="220"
        filterCell={StoreFilterCell}
        cell={({ dataItem }) => <td>{dataItem.store?.name ?? ''}</td>}
      />
      <Column
        field="type"
        title="Kundetype"
        width="150"
        filterCell={TypeFilterCell}
        cell={propsCell => {
          return propsCell.dataItem.type === 2 ? <td>MiniAdmin</td> : <td>Visitation</td>;
        }}
      />
      <GridNoRecords>{MSG_NO_DATA}</GridNoRecords>
      <Column field="active" title="Aktiv" width="130" filter="boolean" cell={ActiveCell} filterCell={ActiveFilterCell} />
      {props.user.user_group_id == USER_GROUP_ADMIN ? (
        <Column
          filterable={false}
          width="100"
          cell={({ dataItem }) => {
            return (
              <td>
                <IconButton size="small" onClick={() => changePassword(dataItem)} title="Skift adgangskode">
                  <Icon fontSize="small">vpn_key</Icon>
                </IconButton>
                <IconButton size="small" onClick={() => changeLoginSetting(dataItem)} title="Log ind indstilling">
                  <Icon fontSize="small">settings</Icon>
                </IconButton>
                <IconButton size="small" onClick={() => handleUpdateWallet(dataItem)} title="Update wallet">
                  <Icon fontSize="small">account_balance_wallet</Icon>
                </IconButton>
              </td>
            );
          }}
        />
      ) : null}
    </Grid>
  );
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      showMessage,
      showSuccessMessage,
      showErrorMessage,
      openDialog,
      closeDialog,
    },
    dispatch,
  );
}

function mapStateToProps({ auth }) {
  return {
    pagePermission: getPagePermission('customer', auth.user),
    user: auth.user,
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CustomerList));

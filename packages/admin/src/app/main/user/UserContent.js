import React, { useEffect, useState, useCallback } from 'react';
import axios from 'app/axios';
import { Grid, GridColumn as Column, GridToolbar, GridNoRecords } from '@progress/kendo-react-grid';
import { process } from '@progress/kendo-data-query';
import { bindActionCreators } from '@reduxjs/toolkit';
import { connect, useSelector } from 'react-redux';
import { TextFilterCell, NumberFilterCell, DropdownFilterCell, ActiveFilterCell, ActiveCell, GridToolbarCustom } from 'app/kendo/CustomCell';
import { showErrorMessage, showSuccessMessage } from 'app/store/fuse/messageSlice';
import { openDialog, closeDialog } from 'app/store/fuse/dialogSlice';
import { withRouter } from 'react-router';
import UserForm from './UserForm';
import ChangePasswordForm from './ChangePasswordForm';
import { IconButton, Icon } from '@material-ui/core';
import { getPagePermission, MSG_NO_DATA } from 'app/constants';
import LoadingPanel from 'app/kendo/LoadingPanel';
import { useKeyListener } from 'app/shared-components/KeyListener';
import { changeUrlParamByDataState, initDataState, parseUrlParams, } from 'app/helper/general.helper';

let data;
const moduleName = 'user';
const filterTypeList = {
  _id: 'number',
  user_group_id: 'number',
  name: 'text',
  username: 'text',
  active: 'boolean',
};


const UserContent = props => {
  const query = parseUrlParams(props.location.search);
  const [result, setResult] = useState(null);
  const [dataState, setDataState] = useState(initDataState(query, filterTypeList));
  const [userGroupList, setUserGroupList] = useState([]);
  const storeList = useSelector(({ fuse }) => fuse.cache.storeList);

  const initData = () => {
    axios
      .get(`/users`)
      .then(response => {
        data = response.data.data;
        processDataToResult(dataState);
      })
      .catch(error => {
      });
    axios
      .get(`/user-groups`, {})
      .then(response => {
        setUserGroupList(
          response.data.data.map(x => {
            return {
              _id: x._id,
              name: x.name,
            };
          }),
        );
      })
      .catch(error => {
      });
  };
  useKeyListener(1, initData);

  const processDataToResult = dataState => {
    if (data) {
      setResult(process(data.slice(0), dataState));
    }
  };

  const onDataStateChange = e => {
    changeUrlParamByDataState(props.history, moduleName, e.dataState);
  };

  useEffect(() => {
    initData();
  }, []);

  useEffect(() => {
    let newDataState = initDataState(query, filterTypeList, moduleName);
    setDataState(newDataState);

    if (data) {
      processDataToResult(newDataState);
    }
  }, [props.location]);

  const add = dataItem => {
    axios
      .post(`/users`, {
        username: dataItem.username.trim(),
        name: dataItem.name.trim(),
        user_group_id: dataItem.user_group_id,
        password: dataItem.password,
        active: dataItem.active,
        store_id: dataItem.store_id ?? null,
      })
      .then(response => {
        data = [response.data.data, ...data];
        processDataToResult(dataState);

        props.closeDialog();
        props.showSuccessMessage();
      })
      .catch(error => { });
  };

  const update = dataItem => {
    axios
      .put(
        `/users/${dataItem._id}`,
        dataItem.password
          ? { password: dataItem.password }
          : {
            _id: dataItem._id,
            username: dataItem.username.trim(),
            name: dataItem.name.trim(),
            user_group_id: dataItem.user_group_id,
            active: dataItem.active,
            store_id: dataItem.store_id ?? null,
          },
      )
      .then(response => {
        delete response.data.data.password;
        data = data.map(user => {
          if (user._id === response.data.data._id) {
            return response.data.data;
          }
          return user;
        }),
          processDataToResult(dataState);

        props.showSuccessMessage();
        props.closeDialog();
      })
      .catch(error => { });
  };

  const remove = dataItem => {
    axios
      .delete(`/users/${dataItem._id}`)
      .then(response => {
        data = data.filter(x => {
          return x._id !== dataItem._id;
        });
        processDataToResult(dataState);

        props.closeDialog();
        props.showSuccessMessage();
      })
      .catch(error => { });
  };

  const handleAdd = () => {
    if (!props.pagePermission.insert) {
      return;
    }

    props.openDialog({
      children: (
        <UserForm
          closeDialog={props.closeDialog}
          openDialog={props.openDialog}
          cancel={props.closeDialog}
          onSubmit={add}
          dataItem={{ ...{ _id: undefined, username: '', name: '', password: '', user_group_id: 2, active: true }, userGroupList }}
          storeList={storeList}
        />
      ),
    });
  };

  const handleUpdate = dataItem => {
    if (!props.pagePermission.update) {
      return;
    }

    props.openDialog({
      children: (
        <UserForm
          closeDialog={props.closeDialog}
          openDialog={props.openDialog}
          isEdit={true}
          cancel={props.closeDialog}
          onSubmit={update}
          remove={remove}
          dataItem={{ ...dataItem, userGroupList }}
          pagePermission={props.pagePermission}
          storeList={storeList}
        />
      ),
    });
  };

  const changePassword = user => {
    if (!props.pagePermission.update) {
      return;
    }

    props.openDialog({
      children: (
        <ChangePasswordForm
          closeDialog={props.closeDialog}
          openDialog={props.openDialog}
          user={user}
          onSubmit={data => {
            update({ _id: user._id, password: data.password });
          }}
        />
      ),
    });
  };

  const handleEdit = e => {
    const field = e.field || '';

    setItemEditing({ ...itemEditing, [field]: e.value });
  };

  const UserGroupFilter = useCallback(
    propFilter => {
      return <DropdownFilterCell {...propFilter} data={userGroupList} />;
    },
    [userGroupList],
  );

  const ActionCell = propsCell => {
    return (
      <td>
        {props.pagePermission.insert ? (
          <IconButton onClick={() => changePassword(propsCell.dataItem)} title="Skift adgangskode">
            <Icon>vpn_key</Icon>
          </IconButton>
        ) : null}
        {/* {props.pagePermission.delete ? <CommandCell {...propsCell} remove={remove} removeTitle={`Vil du slette brugeren ${propsCell.dataItem.name}?`} /> : null} */}
      </td>
    );
  };

  if (!result || !userGroupList) {
    return <LoadingPanel />;
  } else {
    return (
      <>
        <Grid
          className="container-default"
          {...dataState}
          data={result}
          onDataStateChange={onDataStateChange}
          sortable
          filterable
          onItemChange={handleEdit}
          onRowDoubleClick={({ dataItem }) => {
            handleUpdate(dataItem);
          }}>
          <GridToolbar>
            <GridToolbarCustom
              dataState={dataState} onClearChange={onDataStateChange}
              insert={props.pagePermission.insert} handleAdd={handleAdd} />
          </GridToolbar>
          <GridNoRecords>{MSG_NO_DATA}</GridNoRecords>
          <Column field="_id" title="ID" filter="numeric" width="140px" filterCell={NumberFilterCell} />
          <Column field="username" title="Brugernavn" filterCell={TextFilterCell} />
          <Column field="name" title="Navn" filterCell={TextFilterCell} />
          <Column
            field="user_group_id"
            title="Gruppe"
            filterCell={UserGroupFilter}
            width="240"
            cell={propsCell => <td>{propsCell.dataItem.user_group_name}</td>}
          />
          <Column field="active" title="Aktiv" filter="boolean" filterCell={ActiveFilterCell} cell={ActiveCell} width="140" />
          {props.pagePermission.update ? <Column title="Handling" filterable={false} width="200" cell={ActionCell} /> : null}
        </Grid>
      </>
    );
  }
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      showErrorMessage,
      showSuccessMessage,
      openDialog,
      closeDialog,
    },
    dispatch,
  );
}

function mapStateToProps({ auth }) {
  return {
    pagePermission: getPagePermission('user', auth.user),
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(UserContent));

import React, { useEffect, useState } from 'react';
import axios from 'app/axios';
import { Grid, GridColumn as Column, GridToolbar, GridNoRecords } from '@progress/kendo-react-grid';
import { bindActionCreators } from '@reduxjs/toolkit';
import { process } from '@progress/kendo-data-query';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { showErrorMessage, showSuccessMessage } from 'app/store/fuse/messageSlice';
import { openDialog, closeDialog } from 'app/store/fuse/dialogSlice';
import { TextFilterCell, NumberFilterCell, GridToolbarCustom } from 'app/kendo/CustomCell';
import StoreForm from './StoreForm';
import LoadingPanel from 'app/kendo/LoadingPanel';
import { getPagePermission, MSG_NO_DATA } from 'app/constants';
import { changeUrlParamByDataState, initDataState, parseUrlParams } from 'app/helper/general.helper';
import { useKeyListener } from 'app/shared-components/KeyListener';

let data = null;
const moduleName = 'store';
const filterTypeList = {
  _id: 'number',
  name: 'text',
  address: 'text',
  email: 'text',
  kardex_number: 'text',
  bakery_email: 'text',
};

const StoreContent = props => {
  const query = parseUrlParams(props.location.search);
  const [result, setResult] = useState(null);
  const [dataState, setDataState] = useState(initDataState(query, filterTypeList));

  const processDataToResult = dataState => {
    if (data) {
      setResult(process(data.slice(0), dataState));
    }
  };

  const onDataStateChange = e => {
    changeUrlParamByDataState(props.history, moduleName, e.dataState);
  };
  const initData = () => {
    axios
      .get(`/stores`, {})
      .then(response => {
        data = response.data.data;
        processDataToResult(dataState);
      });
  };
  useKeyListener(1, initData);

  useEffect(() => {
    initData();
    return () => {
      data = null;
    };
  }, []);

  useEffect(() => {
    let newDataState = initDataState(query, filterTypeList);
    setDataState(newDataState);

    if (data) {
      processDataToResult(newDataState);
    }
  }, [props.location]);

  const add = dataItem => {
    axios
      .post(`/stores`, dataItem)
      .then(response => {
        dataItem._id = response.data.data._id;
        data = [dataItem, ...data];
        processDataToResult(dataState);

        props.showSuccessMessage();
        props.closeDialog();
      });
  };

  const update = dataItem => {
    if (dataItem.payment.length == 0) {
      dataItem.payment = ['No Payment'];
    }
    dataItem.zip_code_id = dataItem.zip_code_id._id;
    dataItem.municipality_list = dataItem.municipality_list.map(x => x._id);

    axios
      .put(`/stores/${dataItem._id}`, dataItem)
      .then(response => {
        data = data.map(x => (x._id === response.data.data._id ? dataItem : x));
        processDataToResult(dataState);

        props.showSuccessMessage();
        props.closeDialog();
      });
  };

  const remove = dataItem => {
    if (!props.pagePermission.delete) {
      return;
    }

    axios
      .delete(`/stores/${dataItem._id}`)
      .then(response => {
        const newData = data.filter(x => {
          return x._id !== dataItem._id;
        });
        setData(newData);
        props.showSuccessMessage();
        props.closeDialog();
      })
      .catch(error => {
        props.closeDialog();
      });
  };

  const handleAdd = () => {
    if (!props.pagePermission.insert) {
      return;
    }

    props.openDialog({
      children: (
        <StoreForm
          closeDialog={props.closeDialog}
          openDialog={props.openDialog}
          cancel={() => {
            props.closeDialog();
          }}
          onSubmit={add}
          dataItem={{
            name: '',
            address: '',
            city: '',
            zip_code_id: null,
            send_packing_slip: true,
            municipality_list: [],
            kardex_number: '',
            has_its_own_prices: false,
            has_quickpay: false,
            has_quickpay_capture_activated: false,
            bakery_email: '',
            quickpay_info: {
              secret: '',
              secret_key_account: '',
              api_key: '',
              agreement_id: '',
              merchant: '',
              card_type: ''
            },
            checkout_info: {
              phone: '',
              email: '',
              cvr_number: ''
            },
            payment: [],
            email: ''
          }}
        />
      )
    });
  };

  const handleUpdate = dataItem => {
    if (!props.pagePermission.update) {
      return;
    }

    props.openDialog({
      children: (
        <StoreForm closeDialog={props.closeDialog} openDialog={props.openDialog} dataItem={{ ...dataItem }} onSubmit={update} cancel={props.closeDialog} remove={remove} pagePermission={props.pagePermission} />
      )
    });
  };

  if (!result) {
    return <LoadingPanel />;
  } else {
    return (
      <div className="p-24">
        <Grid
          className="container-default"
          filterable
          {...dataState}
          data={result}
          onDataStateChange={onDataStateChange}
          sortable
          resizable
          editField="inEdit"
          onRowDoubleClick={({ dataItem }) => handleUpdate(dataItem)}>
          <GridToolbar>
            <GridToolbarCustom
              dataState={dataState} onClearChange={onDataStateChange}
              insert={props.pagePermission.insert} handleAdd={handleAdd} />
          </GridToolbar>
          <GridNoRecords>{MSG_NO_DATA}</GridNoRecords>
          <Column field="_id" title="ID" width="80" filterCell={NumberFilterCell} />
          <Column field="name" title="Navn" width="250" filterCell={TextFilterCell} />
          <Column
            field="address"
            title="Adresse"
            width="200"
            filterCell={TextFilterCell}
            cell={propsCell => {
              return (
                <td onDoubleClick={() => handleUpdate(propsCell.dataItem)}>
                  <p>{propsCell.dataItem.address}</p>
                  <p>
                    {propsCell.dataItem.zip_code_info.zip_code} {propsCell.dataItem.zip_code_info.city_name}
                  </p>
                </td>
              );
            }}
          />
          <Column
            field="email"
            title="Email"
            minWidth="300"
            filterCell={TextFilterCell}
            cell={propsCell => {
              return (
                <td onDoubleClick={() => handleUpdate(propsCell.dataItem)}>
                  {propsCell.dataItem.email.split(',').map((x, i) => {
                    return <p key={i}>{x}</p>;
                  })}
                </td>
              );
            }}
          />
          <Column field="kardex_number" title="Kardex Nummer" width="150" filterCell={TextFilterCell} />
          <Column field="bakery_email" title="Bakery Email" minWidth="300" filterCell={TextFilterCell} />
        </Grid>
      </div>
    );
  }
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      showErrorMessage,
      showSuccessMessage,
      openDialog,
      closeDialog
    },
    dispatch
  );
}

function mapStateToProps({ auth }) {
  return {
    pagePermission: getPagePermission('store', auth.user),
    user: auth.user
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(StoreContent));

import React, { useState, useEffect } from 'react';
import axios from 'app/axios';
import { process } from '@progress/kendo-data-query';
import { showErrorMessage, showSuccessMessage } from 'app/store/fuse/messageSlice';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { bindActionCreators } from '@reduxjs/toolkit';
import { Grid, GridColumn as Column, GridToolbar } from '@progress/kendo-react-grid';
import { TextFilterCell, NumberFilterCell, GridToolbarCustom } from 'app/kendo/CustomCell';
import { getPagePermission } from 'app/constants';
import { openDialog, closeDialog } from 'app/store/fuse/dialogSlice';
import MailForm from './MailForm';
import { useKeyListener } from 'app/shared-components/KeyListener';
import LoadingPanel from 'app/kendo/LoadingPanel';
import { changeUrlParamByDataState, initDataState, parseUrlParams } from 'app/helper/general.helper';

let data = null;
const moduleName = 'setting';
const filterTypeList = {
  _id: 'number',
  key: 'text',
  name: 'text',
};

function MailContent(props) {
  const query = parseUrlParams(props.location.search);
  const [result, setResult] = useState(null);
  const [dataState, setDataState] = useState(initDataState(query, filterTypeList));
  const initData = () => {
    axios
      .get('/mails')
      .then(response => {
        data = response.data.data;
        processDataToResult(dataState);
      })
      .catch(error => {
      });
  };
  useKeyListener(1, initData);

  useEffect(() => {
    let newDataState = initDataState(query, filterTypeList);
    setDataState(newDataState);

    processDataToResult(newDataState);
  }, [props.location]);

  const processDataToResult = dataState => {
    if (data) {
      setResult(process(data.slice(0), dataState));
    }
  };

  const onDataStateChange = e => {
    changeUrlParamByDataState(props.history, moduleName, e.dataState, filterTypeList, { tab: 1 });
  };

  useEffect(() => {
    initData();

    return () => {
      data = null;
    };
  }, []);

  const add = dataItem => {
    axios
      .post(`/mails`, {
        key: dataItem.key.trim(),
        name: dataItem.name.trim(),
        subject: dataItem.subject,
        content: dataItem.content
      })
      .then(response => {
        data = [response.data.data, ...data];
        processDataToResult(dataState);

        props.closeDialog();
        props.showSuccessMessage();
      })
      .catch(error => {
      });
  };

  const update = dataItem => {
    axios
      .put(`/mails/${dataItem._id}`, {
        key: dataItem.key.trim(),
        name: dataItem.name.trim(),
        subject: dataItem.subject,
        content: dataItem.content
      })
      .then(response => {
        data = data.map(x => (x._id === response.data.data._id ? dataItem : x));
        processDataToResult(dataState);

        props.showSuccessMessage();
        props.closeDialog();
      })
      .catch(error => {
      });
  };

  // const remove = dataItem => {
  //   axios
  //     .delete(`/mails/${dataItem._id}`)
  //     .then(response => {
  //       const newMailList = mailList.filter(x => {
  //         return x._id !== dataItem._id;
  //       });
  //       setMailList(newMailList);

  //       showSuccessMessage();
  //     })
  //     .catch(error => {
  //       showErrorMessage(error.message);
  //     });
  // };

  const handleAdd = () => {
    if (!props.pagePermission.insert) {
      return;
    }

    props.openDialog({
      children: (
        <MailForm
          closeDialog={props.closeDialog}
          openDialog={props.openDialog}
          cancel={() => {
            props.closeDialog();
          }}
          onSubmit={e => {
            add(e);
            props.closeDialog();
          }}
          dataItem={{ _id: undefined, key: '', name: '', content: '' }}
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
        <MailForm
          closeDialog={props.closeDialog}
          openDialog={props.openDialog}
          isEdit={true}
          cancel={() => {
            props.closeDialog();
          }}
          onSubmit={e => {
            update(e);
            props.closeDialog();
          }}
          // remove={remove}
          dataItem={dataItem}
        />
      )
    });
  };

  if (!result) {
    return <LoadingPanel />;
  } else {
    return (
      <>
        <Grid
          data={result}
          {...dataState}
          onDataStateChange={onDataStateChange}
          filterable
          sortable
          onRowDoubleClick={({ dataItem }) => {
            if (!props.pagePermission.update) {
              return;
            }
            handleUpdate(dataItem);
          }}
        >
          <GridToolbar>
            <GridToolbarCustom
              dataState={dataState} onClearChange={onDataStateChange}
              insert={props.pagePermission.insert} handleAdd={handleAdd} />
          </GridToolbar>
          <Column field="_id" title="ID" width="100px" filterCell={NumberFilterCell} />
          <Column field="key" title="Nøgle" width="300px" filterCell={TextFilterCell} />
          <Column field="name" title="Navn" filterCell={TextFilterCell} />
        </Grid>
      </>
    );
  }
}

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
    pagePermission: getPagePermission('setting', auth.user)
    // user: auth.user
  };
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MailContent));

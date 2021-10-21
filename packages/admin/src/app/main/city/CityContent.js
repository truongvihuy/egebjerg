import { useState, useEffect } from 'react';
import axios from 'app/axios';
import { Grid, GridNoRecords, GridColumn as Column, GridToolbar } from '@progress/kendo-react-grid';
import { process } from '@progress/kendo-data-query';

import { bindActionCreators } from '@reduxjs/toolkit';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { showSuccessMessage } from 'app/store/fuse/messageSlice';
import { openDialog, closeDialog } from 'app/store/fuse/dialogSlice';
import { TextFilterCell, NumberFilterCell, GridToolbarCustom, CustomPaging } from 'app/kendo/CustomCell';
import CityForm from './CityForm';
import LoadingPanel from 'app/kendo/LoadingPanel';
import { getPagePermission, MSG_NO_DATA, PAGING_CONFIG } from 'app/constants';
import { changeUrlParamByDataState, setPagingConfig, initDataState, parseUrlParams } from 'app/helper/general.helper';
import { useKeyListener } from 'app/shared-components/KeyListener';

let data = null;
const moduleName = 'city';

const filterTypeList = {
  _id: 'number',
  name: 'text',
};

const CityContent = props => {
  const query = parseUrlParams(props.location.search);
  const [result, setResult] = useState();
  const [dataState, setDataState] = useState(initDataState(query, filterTypeList, moduleName));

  const processDataToResult = dataState => {
    if (data) {
      setResult(process(data.slice(0), dataState));
    }
  };

  const onDataStateChange = e => {
    changeUrlParamByDataState(props.history, moduleName, e.dataState);
    if (e.dataState.take !== dataState.take) {
      setPagingConfig(moduleName, e.dataState.take);
    }
  };

  const initData = () => {
    axios.get('/cities/all').then(res => {
      if (res?.data?.data?.length > 0) {
        data = res.data.data;
        processDataToResult(dataState);
      }
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
    let newDataState = initDataState(query, filterTypeList, moduleName);
    setDataState(newDataState);

    if (data) {
      processDataToResult(newDataState);
    }
  }, [props.location]);

  const add = dataItem => {
    axios
      .post(`/cities`, {
        name: dataItem.name,
      })
      .then(response => {
        dataItem._id = response.data.data._id;
        data = [dataItem, ...data];
        processDataToResult(dataState);

        props.closeDialog();
        props.showSuccessMessage();
      }).catch(e => {
      });
  };

  const update = dataItem => {
    axios
      .put(`/cities/${dataItem._id}`, {
        _id: dataItem._id,
        name: dataItem.name,
        municipality_id: dataItem.municipality_id,
        municipality_name: dataItem.municipality_name,
      })
      .then(response => {
        data = data.map(x => (x._id === response.data.data._id ? dataItem : x));
        processDataToResult(dataState);

        props.closeDialog();
        props.showSuccessMessage();
      }).catch(e => {
      });
  };

  const remove = dataItem => {
    axios.delete(`/cities/${dataItem._id}`).then(response => {
      data = data.filter(x => {
        return x._id !== dataItem._id;
      });
      processDataToResult(dataState);

      props.showSuccessMessage();
      props.closeDialog();
    }).catch(e => {
      props.closeDialog();
    });
  };

  const handleAdd = () => {
    if (!props.pagePermission.insert) {
      return;
    }

    props.openDialog({
      children: <CityForm dataItem={{ name: '' }} onSubmit={add} closeDialog={props.closeDialog} openDialog={props.openDialog} />,
    });
  };

  const handleUpdate = dataItem => {
    if (!props.pagePermission.update) {
      return;
    }

    props.openDialog({
      children: (
        <CityForm dataItem={{ ...dataItem }} onSubmit={update} remove={remove} pagePermission={props.pagePermission} closeDialog={props.closeDialog} openDialog={props.openDialog} />
      ),
    });
  };

  return !data ? (
    <LoadingPanel />
  ) : (
    <Grid
      className="container-default"
      data={result}
      {...dataState}
      onDataStateChange={onDataStateChange}
      filterable
      sortable
      pageable={PAGING_CONFIG}
      pager={CustomPaging}
      onRowDoubleClick={({ dataItem }) => handleUpdate(dataItem)}>
      <GridToolbar>
        <GridToolbarCustom
          dataState={dataState} onClearChange={onDataStateChange}
          insert={props.pagePermission.insert} handleAdd={handleAdd} />
      </GridToolbar>
      <GridNoRecords>{MSG_NO_DATA}</GridNoRecords>
      <Column field="_id" title="ID" width="150" filterCell={NumberFilterCell} />
      <Column field="name" title="By" filterCell={TextFilterCell} />
    </Grid>
  );
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      showSuccessMessage,
      openDialog,
      closeDialog,
    },
    dispatch,
  );
}

function mapStateToProps({ auth }) {
  return {
    pagePermission: getPagePermission(moduleName, auth.user),
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CityContent));

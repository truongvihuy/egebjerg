import { useState, useEffect, useRef } from 'react';
import axios from 'app/axios';
import { GridNoRecords, Grid, GridColumn as Column, GridToolbar } from '@progress/kendo-react-grid';
import { withRouter } from 'react-router';
import { bindActionCreators } from '@reduxjs/toolkit';
import { connect } from 'react-redux';
import { showSuccessMessage } from 'app/store/fuse/messageSlice';
import { openDialog, closeDialog } from 'app/store/fuse/dialogSlice';
import { TextFilterCell, NumberFilterCell, GridToolbarCustom, CustomPaging } from 'app/kendo/CustomCell';
import BrandForm from './BrandForm';
import LoadingPanel from 'app/kendo/LoadingPanel';
import { useGridScrollTop, useKeyListener } from 'app/shared-components/KeyListener';
import { getPagePermission, MSG_NO_DATA, PAGING_CONFIG } from 'app/constants';
import { setIsUpdatingConfig } from 'app/auth/Auth';
import { initDataState, NumberDataState, TextDataState, parseUrlParams, processFilterToParams, changeUrlParamByDataState } from 'app/helper/general.helper';

const moduleName = 'brand';
const filterTypeList = {
  '_id': NumberDataState,
  'name': TextDataState,
};

const BrandContent = props => {
  const query = parseUrlParams(props.location.search);
  const [dataState, setDataState] = useState(initDataState(query, filterTypeList, moduleName));
  const [data, setData] = useState();
  let total = useRef(0);

  const getData = (tmpDataState = dataState) => {
    let params = {
      limit: tmpDataState.take
    };
    params = processFilterToParams(tmpDataState.filter, params);
    params.page = 1 + tmpDataState.skip / tmpDataState.take;
    axios
      .get(`/brands`, { params })
      .then(response => {
        const newData = response.data.data;
        if (typeof newData.total != 'undefined') {
          total.current = newData.total;
        }
        setData(newData.brand_list);
      })
      .catch(error => {
      });
  };

  useKeyListener(1, getData);
  useGridScrollTop([dataState.skip]);

  useEffect(() => {
    let newDataState = initDataState(query, filterTypeList, moduleName);
    setDataState(newDataState);

    getData(newDataState);
  }, [props.location]);

  const onDataStateChange = e => {
    changeUrlParamByDataState(props.history, moduleName, e.dataState);
    if (e.dataState.take !== dataState.take) {
      setPagingConfig(moduleName, e.dataState.take);
    }
  };

  const add = dataItem => {
    axios
      .post(`/brands`, {
        name: dataItem.name,
      })
      .then(response => {
        dataItem._id = response.data.data._id;
        let newData = [dataItem, ...data];
        setData(newData);
        props.closeDialog();
        props.showSuccessMessage();
      });
  };

  const update = dataItem => {
    setIsUpdatingConfig(true);
    axios
      .put(`/brands/${dataItem._id}`, {
        _id: dataItem._id,
        name: dataItem.name,
        municipality_id: dataItem.municipality_id,
        municipality_name: dataItem.municipality_name,
      })
      .then(response => {
        let newData = data.map(x => (x._id === response.data.data._id ? dataItem : x));
        setData(newData);

        props.closeDialog();
        props.showSuccessMessage();
      });
  };

  const remove = dataItem => {
    setIsUpdatingConfig(true);
    axios.delete(`/brands/${dataItem._id}`).then(response => {
      let newData = data.filter(x => {
        return x._id !== dataItem._id;
      });
      setData(newData);

      props.showSuccessMessage();
    });
  };

  const handleAdd = () => {
    if (!props.pagePermission.insert) {
      return;
    }

    props.openDialog({
      children: <BrandForm closeDialog={props.closeDialog} openDialog={props.openDialog} dataItem={{ name: '' }} onSubmit={add} cancel={props.closeDialog} />,
    });
  };

  const handleUpdate = dataItem => {
    if (!props.pagePermission.update) {
      return;
    }

    props.openDialog({
      children: (
        <BrandForm closeDialog={props.closeDialog} openDialog={props.openDialog} dataItem={{ ...dataItem }} onSubmit={update} cancel={props.closeDialog} remove={data => { remove(data); props.closeDialog() }} pagePermission={props.pagePermission} />
      ),
    });
  };

  return !data ? (
    <LoadingPanel />
  ) : (
    <Grid
      className="container-default"
      data={data}
      {...dataState}
      onDataStateChange={onDataStateChange}
      filterable
      sortable
      pageable={PAGING_CONFIG}
      pager={CustomPaging}
      total={total.current}
      onRowDoubleClick={({ dataItem }) => handleUpdate(dataItem)}>
      <GridToolbar>
        <GridToolbarCustom
          dataState={dataState} onClearChange={onDataStateChange}
          insert={props.pagePermission.insert} handleAdd={handleAdd} />
      </GridToolbar>
      <GridNoRecords>{MSG_NO_DATA}</GridNoRecords>
      <Column field="_id" title="ID" width="150" filterCell={NumberFilterCell} />
      <Column field="name" title="Producent" filterCell={TextFilterCell} />
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
    pagePermission: getPagePermission('brand', auth.user),
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(BrandContent));

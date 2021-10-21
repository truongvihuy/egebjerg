import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'app/axios';
import { Grid, GridColumn as Column, GridToolbar, GridNoRecords } from '@progress/kendo-react-grid';
import { bindActionCreators } from '@reduxjs/toolkit';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { showSuccessMessage } from 'app/store/fuse/messageSlice';
import { openDialog, closeDialog } from 'app/store/fuse/dialogSlice';
import { NumberFilterCell, DropdownFilterCell, GridToolbarCustom, CustomPaging } from 'app/kendo/CustomCell';
import useForceUpdate from '@fuse/hooks/useForceUpdate';
import ZipCodeForm from './ZipCodeForm';
import LoadingPanel from 'app/kendo/LoadingPanel';
import { getPagePermission, MSG_NO_DATA, PAGING_CONFIG } from 'app/constants';
import { changeUrlParamByDataState, initDataState, parseUrlParams, } from 'app/helper/general.helper';
import { useKeyListener, useGridScrollTop } from 'app/shared-components/KeyListener';

const moduleName = 'zip-code';
const filterTypeList = {
  _id: 'number',
  zip_code: 'number',
  city_id: 'number',
  municipality_id: 'number',
};


const ZipCodeContent = (props) => {
  const query = parseUrlParams(props.location.search);
  const [forceUpdate] = useForceUpdate();
  const [data, setData] = useState(null);
  const [dataState, setDataState] = useState(initDataState(query, filterTypeList, moduleName));
  const dataRef = useRef(data);
  let total = useRef(0);

  const municipalityList = useRef([]);
  const cityList = useRef([]);

  useGridScrollTop([dataState.skip]);

  const initData = () => {
    let params = { field: '_id,name' };
    axios.get(`/municipalities`, { params }).then((response) => {
      const newData = response.data.data;
      municipalityList.current = newData;
      forceUpdate();
    });
    axios.get(`/cities/all`, { params }).then((response) => {
      const newData = response.data.data;
      cityList.current = newData;
      forceUpdate();
    });
  };
  useKeyListener(1, initData);
  useEffect(() => {
    initData();
  }, []);

  useEffect(() => {
    let newDataState = initDataState(query, filterTypeList, moduleName);
    setDataState(newDataState);

    axios.get(`/zip-codes`, { params: query }).then((response) => {
      const newData = response.data.data.zip_code_list;
      if (response.data.data.total) {
        total.current = response.data.data.total;
      }
      newData.forEach((e) => {
        e.municipality = {
          _id: e.municipality_id,
          name: e.municipality_name,
        };
        e.city = {
          _id: e.city_id,
          name: e.city_name,
        };
      });
      dataRef.current = newData;
      setData(newData);
    });
  }, [props.location]);

  const FilterCell = useCallback((propFilter) => {
    const optionList = propFilter.field === 'municipality_id' ? municipalityList.current : cityList.current;
    return <DropdownFilterCell {...propFilter} data={optionList} />;
  }, []);

  const onStateChange = (e) => {
    changeUrlParamByDataState(props.history, moduleName, e.dataState);
    if (e.dataState.take !== dataState.take) {
      setPagingConfig(moduleName, e.dataState.take);
    }
  };

  const add = (dataItem) => {
    axios
      .post(`/zip-codes`, {
        zip_code: dataItem.zip_code,
        city_id: dataItem.city_id,
        city_name: dataItem.city_name,
        municipality_id: dataItem.municipality_id,
        municipality_name: dataItem.municipality_name,
      })
      .then((response) => {
        dataItem._id = response.data.data._id;
        const newData = [dataItem, ...dataRef.current];
        setData(newData);
        dataRef.current = newData;

        props.closeDialog();
        props.showSuccessMessage();
      }).catch(e => {
      });
  };

  const update = (dataItem) => {
    axios
      .put(`/zip-codes/${dataItem._id}`, {
        _id: dataItem._id,
        zip_code: dataItem.zip_code,
        city_name: dataItem.city_name,
        city_id: dataItem.city_id,
        municipality_id: dataItem.municipality_id,
        municipality_name: dataItem.municipality_name,
      })
      .then((response) => {
        const newData = dataRef.current.map((x) => (x._id === response.data.data._id ? dataItem : x));
        setData(newData);
        dataRef.current = newData;

        props.closeDialog();
        props.showSuccessMessage();
      }).catch(e => {
      });
  };

  const remove = (dataItem) => {
    axios.delete(`/zip-codes/${dataItem._id}`).then((response) => {
      const newData = dataRef.current.filter((x) => {
        return x._id !== dataItem._id;
      });
      setData(newData);
      dataRef.current = newData;

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
      children: (
        <ZipCodeForm
          municipalityList={municipalityList.current}
          cityList={cityList.current}
          dataItem={{ ...initData }}
          onSubmit={add}
          closeDialog={props.closeDialog}
          openDialog={props.openDialog}
        />
      ),
    });
  };

  const handleUpdate = (dataItem) => {
    if (!props.pagePermission.update) {
      return;
    }

    props.openDialog({
      children: (
        <ZipCodeForm
          municipalityList={municipalityList.current}
          cityList={cityList.current}
          dataItem={{ ...dataItem }}
          onSubmit={update}
          remove={remove}
          pagePermission={props.pagePermission}
          closeDialog={props.closeDialog}
          openDialog={props.openDialog}
        />
      ),
    });
  };

  return !data ? (
    <LoadingPanel />
  ) : (
    <Grid
      className="container-default"
      data={data}
      total={total.current}
      {...dataState}
      filterable
      pageable={PAGING_CONFIG}
      pager={CustomPaging}
      onDataStateChange={onStateChange}
      onRowDoubleClick={({ dataItem }) => handleUpdate(dataItem)}>
      <GridToolbar>
        <GridToolbarCustom
          dataState={dataState} onClearChange={onStateChange}
          insert={props.pagePermission.insert} handleAdd={handleAdd} />
      </GridToolbar>
      <GridNoRecords>{MSG_NO_DATA}</GridNoRecords>
      <Column field="_id" title="ID" width="150" filterCell={NumberFilterCell} />
      <Column field="zip_code" title="Postnummer" width="200" filterCell={NumberFilterCell} />
      <Column field="city_id" title="By" filterCell={FilterCell} cell={({ dataItem }) => <td>{dataItem.city_name}</td>} />
      <Column
        field="municipality_id"
        title="Kommune"
        width="400"
        filterCell={FilterCell}
        cell={({ dataItem }) => <td>{dataItem.municipality_name}</td>}
      />
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
    pagePermission: getPagePermission('zip_code', auth.user),
  };
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ZipCodeContent));

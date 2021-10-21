import { useEffect, useState } from 'react';
import axios from 'app/axios';
import { Grid, GridColumn as Column, GridToolbar, GridNoRecords } from '@progress/kendo-react-grid';
import { process } from '@progress/kendo-data-query';
import { bindActionCreators } from '@reduxjs/toolkit';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { showSuccessMessage } from 'app/store/fuse/messageSlice';
import { openDialog, closeDialog } from 'app/store/fuse/dialogSlice';
import { TextFilterCell, NumberFilterCell, GridToolbarCustom, CustomPaging, PriceCell } from 'app/kendo/CustomCell';
import LoadingPanel from 'app/kendo/LoadingPanel';
import MunicipalityForm from './MunicipalityForm';
import { getPagePermission, MSG_NO_DATA, PAGING_CONFIG } from 'app/constants';
import { changeUrlParamByDataState, initDataState, parseUrlParams } from 'app/helper/general.helper';
import { useKeyListener } from 'app/shared-components/KeyListener';

let data;
const moduleName = 'municipality';
const filterTypeList = {
  _id: 'number',
  name: 'text',
  weight_limit: 'number',
  overweight_price: 'number',
};

const MunicipalityContent = props => {
  const query = parseUrlParams(props.location.search);
  const [result, setResult] = useState(null);
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
    axios.get(`/municipalities`, {})
      .then(response => {
        data = response.data.data;
        processDataToResult(dataState);
      });

    return () => {
      data = null;
    };
  };
  useKeyListener(1, initData);
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
      .post(`/municipalities`, {
        name: dataItem.name,
        overweight_price: +dataItem.overweight_price,
        weight_limit: +dataItem.weight_limit,
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
      .put(`/municipalities/${dataItem._id}`, {
        _id: dataItem._id,
        name: dataItem.name,
        overweight_price: dataItem.overweight_price,
        weight_limit: dataItem.weight_limit,
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
    axios.delete(`/municipalities/${dataItem._id}`).then(response => {
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
      children: (
        <MunicipalityForm
          dataItem={{
            name: '',
            weight_limit: 0,
            overweight_price: 0,
          }}
          onSubmit={add}
          closeDialog={props.closeDialog}
          openDialog={props.openDialog}
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
        <MunicipalityForm
          dataItem={{ ...dataItem }}
          onSubmit={update}
          remove={remove}
          pagePermission={props.pagePermission}
          openDialog={props.openDialog}
          closeDialog={props.closeDialog}
        />
      ),
    });
  };

  return !result ? (
    <LoadingPanel />
  ) : (
    <Grid
      className="container-default"
      data={result}
      {...dataState}
      onDataStateChange={onDataStateChange}
      filterable
      pageable={PAGING_CONFIG}
      pager={CustomPaging}
      sortable
      onRowDoubleClick={({ dataItem }) => handleUpdate(dataItem)}>
      <GridToolbar>
        <GridToolbarCustom
          dataState={dataState} onClearChange={onDataStateChange}
          insert={props.pagePermission.insert} handleAdd={handleAdd} />
      </GridToolbar>
      <GridNoRecords>{MSG_NO_DATA}</GridNoRecords>
      <Column field="_id" title="ID" width="150" filterCell={NumberFilterCell} />
      <Column field="name" title="Kommune" filterCell={TextFilterCell} />
      <Column field="weight_limit" title="Vægtgrænse" width="200" filter="numeric" filterCell={NumberFilterCell} />
      <Column field="overweight_price" title="Overvægt pris" width="200" filterCell={NumberFilterCell} cell={propsCell => <PriceCell number={propsCell.dataItem.overweight_price} />} />
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
    pagePermission: getPagePermission('municipality', auth.user),
  };
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MunicipalityContent));

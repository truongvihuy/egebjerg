import { useState, useEffect, useRef } from 'react';
import axios from 'app/axios';
import { GridNoRecords, Grid, GridColumn as Column, GridToolbar } from '@progress/kendo-react-grid';
import { withRouter } from 'react-router';
import { Icon, IconButton } from '@material-ui/core';
import { bindActionCreators } from '@reduxjs/toolkit';
import { connect } from 'react-redux';
import { showSuccessMessage, showErrorMessage } from 'app/store/fuse/messageSlice';
import { openDialog, closeDialog } from 'app/store/fuse/dialogSlice';
import { TextFilterCell, NumberFilterCell, GridToolbarCustom, CustomPaging } from 'app/kendo/CustomCell';
import LoadingPanel from 'app/kendo/LoadingPanel';
import { useGridScrollTop, useKeyListener } from 'app/shared-components/KeyListener';
import { getPagePermission, MSG_NO_DATA, PAGING_CONFIG } from 'app/constants';
import { changeUrlParamByDataState, initDataState, parseUrlParams, processFilterToParams } from 'app/helper/general.helper';
import { setIsUpdatingConfig } from 'app/auth/Auth';

const moduleName = 'tag';
const filterTypeList = {
  _id: 'number',
  name: 'text',
};

const TagContent = props => {
  const query = parseUrlParams(props.location.search);
  const [dataState, setDataState] = useState(initDataState(query, filterTypeList, moduleName));
  const [data, setData] = useState();
  const getData = (tmpDataState = dataState) => {
    let params = {
      limit: tmpDataState.take
    };
    params = processFilterToParams(tmpDataState.filter, params);
    params.page = 1 + tmpDataState.skip / tmpDataState.take;
    axios
      .get(`/tags`, { params })
      .then(response => {
        const newData = response.data.data;
        if (typeof newData.total != 'undefined') {
          total.current = newData.total;
        }
        setData(newData.tag_list);
      })
      .catch(error => {
        props.showErrorMessage();
      });
  };
  useKeyListener(1, getData);

  let total = useRef(0);

  useGridScrollTop([dataState.skip]);

  useEffect(() => {
    let newDataState = initDataState(query, filterTypeList, moduleName);
    setDataState(newDataState);
    getData(dataState);
  }, [props.location]);

  const add = dataItem => {
    setIsUpdatingConfig(true);
    axios
      .post(`/tags`, {
        name: dataItem.name,
      })
      .then(response => {
        dataItem._id = response.data.data._id;
        const newData = [dataItem, ...data];
        setData(newData);
        props.closeDialog();
        props.showSuccessMessage();
      });
  };

  const update = dataItem => {
    setIsUpdatingConfig(true);
    axios
      .put(`/tags/${dataItem._id}`, {
        _id: dataItem._id,
        name: dataItem.name,
        municipality_id: dataItem.municipality_id,
        municipality_name: dataItem.municipality_name,
      })
      .then(response => {
        const newData = data.map(x => (x._id === response.data.data._id ? dataItem : x));
        setData(newData);

        props.closeDialog();
        props.showSuccessMessage();
      });
  };

  const remove = dataItem => {
    setIsUpdatingConfig(true);
    axios
      .delete(`/tags/${dataItem._id}`)
      .then(response => {
        const newData = data.filter(x => {
          return x._id !== dataItem._id;
        });
        setData(newData);

        props.showSuccessMessage();
        props.closeDialog();
      })
      .catch(e => {
        props.closeDialog();
      });
  };

  const handleAdd = () => {
    if (!props.pagePermission.insert) {
      return;
    }

    props.openDialog({
      children: <TagForm closeDialog={props.closeDialog} openDialog={props.openDialog} dataItem={{ name: '' }} onSubmit={add} />,
    });
  };

  const addTagProduct = dataItem => {
    axios.put(`/products/tags`, dataItem).then(response => {
      props.showSuccessMessage();
    });
  };
  const handleAddTagProduct = tag => {
    if (!props.productPermission.update) {
      return;
    }

    props.openDialog({
      maxWidth: '500px',
      children: (
        <AddProductTagForm
          closeDialog={props.closeDialog}
          openDialog={props.openDialog}
          dataItem={{
            tag_id: tag._id,
          }}
          tag={tag}
          onSubmit={addTagProduct}
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
        <TagForm closeDialog={props.closeDialog} openDialog={props.openDialog} dataItem={{ ...dataItem }} onSubmit={update} remove={remove} />
      ),
    });
  };
  const onDataStateChange = e => {
    changeUrlParamByDataState(props.history, moduleName, e.dataState);
    if (e.dataState.take !== dataState.take) {
      setPagingConfig(moduleName, e.dataState.take);
    }
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
        <GridToolbarCustom dataState={dataState} onClearChange={onDataStateChange} insert={props.pagePermission.insert} handleAdd={handleAdd} />
      </GridToolbar>
      <GridNoRecords>{MSG_NO_DATA}</GridNoRecords>
      <Column field="_id" title="ID" width="150" filterCell={NumberFilterCell} />
      <Column field="name" title="Mærke" filterCell={TextFilterCell} />
      <Column
        title="Action"
        cell={({ dataItem }) => {
          return (
            <td>
              <IconButton onClick={() => handleAddTagProduct(dataItem)}>
                <Icon fontSize="small">library_books</Icon>
              </IconButton>
            </td>
          );
        }}
      />
    </Grid>
  );
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
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
    pagePermission: getPagePermission('tag', auth.user),
    productPermission: getPagePermission('product', auth.user),
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TagContent));

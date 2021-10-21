import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'app/axios';
import { GridNoRecords, Grid, GridColumn as Column, GridToolbar } from '@progress/kendo-react-grid';
import { withRouter } from 'react-router';
import { bindActionCreators } from '@reduxjs/toolkit';
import { connect } from 'react-redux';
import { showSuccessMessage, showErrorMessage } from 'app/store/fuse/messageSlice';
import { openDialog, closeDialog } from 'app/store/fuse/dialogSlice';
import { TextFilterCell, NumberFilterCell, GridToolbarCustom, CustomPaging, DropdownFilterCell, DateFilterCell, } from 'app/kendo/CustomCell';
import LoadingPanel from 'app/kendo/LoadingPanel';
import { useGridScrollTop } from 'app/shared-components/KeyListener';
import { getPagePermission, MSG_NO_DATA, PAGING_CONFIG, TASK_STATUS, TASK_STATUS_CONFIG } from 'app/constants';
import { initDataState, convertUnixTime, parseUrlParams, changeUrlParamByDataState } from 'app/helper/general.helper';
import TaskForm from './TaskForm';
import { useKeyListener } from 'app/shared-components/KeyListener';

const moduleName = 'task';
const filterTypeList = {
  '_id': 'number',
  'name': 'text',
  'config.start_time': 'text',
  'config.end_time': 'text',
  'config.time_cycle': 'text',
  'config.day_cycle': 'text',
  'start_time': 'date',
  'end_time': 'date',
  'status': 'number',
};

const TaskContent = props => {
  const query = parseUrlParams(props.location.search);
  const [dataState, setDataState] = useState(initDataState(query, filterTypeList, moduleName));
  const [data, setData] = useState();
  let total = useRef(0);

  const getData = (tmpDataState = dataState) => {
    let params = {
      limit: tmpDataState.take
    };
    if (tmpDataState.filter) {
      for (let i = 0; i < tmpDataState.filter.filters.length; i++) {
        let filterEle = tmpDataState.filter.filters[i];
        if (filterEle.field == '_id') {
          params = {
            limit: tmpDataState.take,
            _id: filterEle.value
          };
          break;
        } else {
          if (['start_time', 'end_time'].includes(filterEle.field)) {
            params[filterEle.field] = filterEle.value / 1000 | 0;
          } else {
            params[filterEle.field] = filterEle.value;
          }
        }
      }
    }
    params.page = 1 + tmpDataState.skip / tmpDataState.take;
    axios
      .get(`/tasks`, { params })
      .then(response => {
        const newData = response.data.data;
        if (typeof newData.total !== 'undefined') {
          total.current = newData.total;
        }
        setData(newData.task_list);
      })
      .catch(error => {
        props.showErrorMessage();
      });
  };
  useKeyListener(null, getData);

  useGridScrollTop([dataState.skip]);

  useEffect(() => {
    const newDataState = initDataState(query, filterTypeList, moduleName)
    setDataState(newDataState);

    getData(newDataState);
  }, [props.location]);

  const onDataStateChange = e => {
    changeUrlParamByDataState(props.history, moduleName, e.dataState, filterTypeList);
    if (e.dataState.take !== dataState.take) {
      setPagingConfig(moduleName, e.dataState.take);
    }
  };

  const add = (dataItem) => {
    axios
      .post(`/tasks`, dataItem)
      .then(response => {
        let newData = [...data];
        newData.unshift(response.data.data);
        setData(newData);
        props.closeDialog();
      });
  }
  const update = (dataItem) => {
    axios
      .put(`/tasks/${dataItem._id}`, dataItem)
      .then(response => {
        setData(data.map(x => {
          if (x._id == response.data.data._id) {
            return response.data.data;
          }
          return x;
        }))
        props.closeDialog();
      });
  }
  const handleAdd = () => {
    if (!props.pagePermission.insert) {
      return;
    }

    props.openDialog({
      maxWidth: 'lg',
      children: <TaskForm closeDialog={props.closeDialog} openDialog={props.openDialog} dataItem={{ name: '', day_of_week: [0, 1, 2, 3, 4, 5, 6], hour: 0 }} onSubmit={add} cancel={props.closeDialog} />,
    });
  };

  const handleUpdate = ({ dataItem }) => {
    if (!props.pagePermission.insert) {
      return;
    }

    props.openDialog({
      maxWidth: 'lg',
      children: <TaskForm closeDialog={props.closeDialog} openDialog={props.openDialog} dataItem={dataItem} onSubmit={update} cancel={props.closeDialog} />,
    });
  };

  const StatusFilterCell = useCallback(propFilter => {
    return <DropdownFilterCell id="status-filter" {...propFilter} data={Object.values(TASK_STATUS_CONFIG)} />;
  }, []);

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
      onRowDoubleClick={(e) => {
        if (e.nativeEvent.target.id == 'status') {
          let task = e.dataItem;
          if (task.status == TASK_STATUS.idle) {
            update({
              ...task,
              status: TASK_STATUS.disable
            });
          }
          if (task.status == TASK_STATUS.disable) {
            update({
              ...task,
              status: TASK_STATUS.idle
            });
          }
        } else {
          handleUpdate(e);
        }
      }}
    >
      <GridToolbar>
        <GridToolbarCustom dataState={dataState} onClearChange={onDataStateChange} handleAdd={handleAdd} insert={props.pagePermission.insert} />
      </GridToolbar>
      <GridNoRecords>{MSG_NO_DATA}</GridNoRecords>
      <Column field="_id" title="ID" width="50" filterCell={NumberFilterCell} />
      <Column field="name" title="Navn" filterCell={TextFilterCell} />
      <Column field="config.start_time" title="Hour start" filterCell={TextFilterCell} />
      <Column field="config.end_time" title="Hour end" filterCell={TextFilterCell} />
      <Column field="config.time_cycle" title="Time cycle(m)" filterCell={TextFilterCell} />
      <Column field="config.day_cycle" title="Day run" filterCell={TextFilterCell} cell={({ dataItem }) => {
        return <td>
          {dataItem?.config?.day_cycle?.length == 7 ? <p>All</p> : dataItem.config?.day_cycle.map(x => {
            return <span> {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][x]}</span>;
          })}
        </td>
      }} />
      <Column field='start_time' title='Siden' filter='date' filterCell={DateFilterCell} cell={({ dataItem }) => (
        <td className='datetime-cell'>
          {dataItem.start_time ? convertUnixTime(dataItem.start_time) : ''}
        </td>
      )} />
      <Column field='end_time' title='Til' filter='date' filterCell={DateFilterCell} cell={({ dataItem }) => (
        <td className='datetime-cell'>
          {dataItem.end_time ? convertUnixTime(dataItem.end_time) : ''}
        </td>
      )} />
      <Column field='status' title='Status' cell={({ dataItem }) => (
        <td id='status' style={{
          textAlign: 'center',
        }}>
          <span style={{
            border: `1px solid`,
            padding: '4px',
            borderRadius: '4px',
            color: TASK_STATUS_CONFIG[dataItem.status]?.color
          }}>
            {TASK_STATUS_CONFIG[dataItem.status]?.name}
          </span>
        </td>
      )} filterCell={StatusFilterCell} />
      <Column field="content" title="Indhold" filterable={false} cell={({ dataItem }) => (
        <td>
          <a target='_blank' href={`/api/tasks/log/${dataItem.content}`}>{dataItem.content}</a>
        </td>
      )} />
    </Grid >
  );
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
    pagePermission: getPagePermission('task', auth.user),
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TaskContent));

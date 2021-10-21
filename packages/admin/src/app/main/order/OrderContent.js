import { useState, useRef, useEffect } from 'react';
import axios from 'app/axios';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import OrderGrid from './tab/OrderGrid';
import OrderDetail from './tab/OrderDetail';
import { openDialog, closeDialog } from 'app/store/fuse/dialogSlice';
import { showSuccessMessage, showErrorMessage } from 'app/store/fuse/messageSlice';
import { changeUrlParamByDataState, initDataState, parseUrlParams, processDataStateToUrlParams, setPagingConfig } from 'app/helper/general.helper';
import { useKeyListener } from 'app/shared-components/KeyListener';
import { endOfDay, getUnixTime, startOfDay } from 'date-fns';

const moduleName = 'order';
const filterTypeList = {
  _id: 'number',
  payment_method: 'text',
  customer_id: 'number',
  status: 'number',
  customer_id: 'number',
  order_by_id: 'number',
  store_id: 'number',
  from_date: 'date',
  to_date: 'date',
  created_date: 'date',
};

function OrderContent(props) {
  const [data, setData] = useState(null);
  const [loadingPanel, setLoadingPanel] = useState(false);
  const query = parseUrlParams(props.location.search);
  const [dataState, setDataState] = useState(initDataState(query, filterTypeList, moduleName));
  const [selected, setSelected] = useState(query.id ? 1 : 0);
  const [dataItem, setDataItem] = useState(null);
  let total = useRef(0);

  const getData = (tmpDataState = dataState) => {
    if (!query.id) {
      getDataList(tmpDataState);
    } else {
      getDataItem(query.id);
    }
  };
  useKeyListener(1, getData);

  useEffect(() => {
    let newDataState = initDataState(query, filterTypeList, moduleName);
    setDataState(newDataState);

    getData(newDataState);
  }, [props.location]);

  const getDataList = (tmpDataState = dataState) => {
    let params = {
      limit: tmpDataState.take,
      ...processDataStateToUrlParams(tmpDataState, {}, true),
    };
    if (params.from_date) {
      params['from_date'] = getUnixTime(startOfDay(params.from_date));
    }
    if (params.to_date) {
      params['to_date'] = getUnixTime(endOfDay(params.to_date));
    }
    if (params.created_date) {
      params['from_date'] = getUnixTime(startOfDay(params.created_date));
      params['to_date'] = getUnixTime(endOfDay(params.created_date));
      delete params.created_date;
    }
    setLoadingPanel(true);
    axios.get(`/orders`, { params })
      .then(({ data }) => {
        if (data.data.total) {
          total.current = data.data.total;
        }
        setData(data.data.order_list);
        setLoadingPanel(false);
      }).catch(e => {
        setLoadingPanel(false);
      });
  };

  const getDataItem = (_id) => {
    axios.get(`/orders/${_id}`)
      .then(({ data }) => {
        setSelected(1);
        setDataItem(data.data);
        if (!data.data) {
          onSelectTab({ selected: 0 });
        }
      });
  }

  const update = (dataItem, updateExtend = null) => {
    let route = `/orders/${(typeof updateExtend === 'string') ? updateExtend + '/' + dataItem._id : dataItem._id}`;
    axios.put(route, dataItem)
      .then(response => {
        let newData = [];
        if (updateExtend === 'claim-more') {
          newData = newData.concat([response.data.data], data);
        } else {
          newData = data.map(x => (x._id === response.data.data._id ? { ...dataItem, ...response.data.data } : x));
        }
        setData(newData);

        // props.history.push(`${props.location.pathname}`);
        if (typeof updateExtend === 'string' && updateExtend === 'claim' && response.data.data.status != 2) {
          props.showErrorMessage();
        } else {
          props.showSuccessMessage();
        }
        props.closeDialog();
      })
      .catch(e => {
      });
  };

  const updateOverweightRate = value => {
    axios.put(`/orders/overweight-rate/${dataItem._id}`, value)
      .then(response => {
        const item = response.data.data;
        const newData = data.map(x => (x._id === item._id ? item : x));
        setData(newData);
        setDataItem(item);

        props.showSuccessMessage();
        props.closeDialog();
      })
      .catch(e => {
      });
  }

  const remove = dataItem => {
    axios.delete(`/orders/${dataItem._id} `)
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

  const onStateChange = e => {
    changeUrlParamByDataState(props.history, moduleName, e.dataState, filterTypeList);
    if (e.dataState.take !== dataState.take) {
      setPagingConfig(moduleName, e.dataState.take);
    }
  };

  const onSelectTab = (e, dataItem = null) => {
    if (dataItem && dataItem._id) {
      props.history.push({
        pathname: `/order`,
        search: `?id=${dataItem._id}`,
      }, {
        fromList: true
      });
      setDataItem(dataItem);
    } else {
      props.history.location.state?.fromList
        ? props.history.goBack()
        : props.history.push({
          pathname: `/order`,
        });
      setDataItem(null);
      if (!data) {
        getDataList();
      }
    }
    setSelected(e.selected);
  };
  return (
    selected === 0
      ? <OrderGrid
        className='container-default'
        data={data} total={total.current}
        dataState={dataState} onStateChange={onStateChange}
        onUpdate={update} onRemove={remove}
        onChangeTab={(dataItem) => onSelectTab({ selected: 1 }, dataItem)}
        loadingPanel={loadingPanel}
      />
      : <OrderDetail
        className='container-default'
        dataItem={dataItem} onUpdateOverweightRate={updateOverweightRate}
        onChangeTab={() => onSelectTab({ selected: 0 })}
      />
  )
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      showErrorMessage,
      showSuccessMessage,
      openDialog,
      closeDialog,
    },
    dispatch
  );
}
export default withRouter(connect(null, mapDispatchToProps)(OrderContent));

import { useState, useEffect } from 'react';
import axios from 'app/axios';
import { TabStrip, TabStripTab } from '@progress/kendo-react-layout';
import { bindActionCreators } from '@reduxjs/toolkit';
import { connect } from 'react-redux';
import { showSuccessMessage } from 'app/store/fuse/messageSlice';
import { closeDialog } from 'app/store/fuse/dialogSlice';
import NewspaperGrid from './tab/NewspaperGrid';
import NewspaperOfferList from './tab/NewspaperOfferList';
import NewspaperProductList from './tab/NewspaperProductList';
import { withRouter } from 'react-router-dom';
import { parseUrlParams } from 'app/helper/general.helper';
import LoadingPanel from 'app/kendo/LoadingPanel';
import { useKeyListener } from 'app/shared-components/KeyListener';
import { startOfDay } from 'date-fns';

function NewspaperContent(props) {
  const query = parseUrlParams(props.location.search);

  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(+(query.tab ?? 0));

  const initData = () => {
    axios.get(`/newspapers`, {})
      .then(response => {
        const newData = response.data.data;
        newData.forEach(e => {
          e.from = new Date(e.from * 1000);
          e.to = new Date(e.to * 1000);
          e.from_date = startOfDay(e.from);
          e.to_date = startOfDay(e.to);
        });
        setData(newData);
      });
    const query = parseUrlParams(props.location.search);
    if (query.newspaper_id) {
      onSelectTab({ selected: 1 }, { _id: query.newspaper_id });
    } else {
      if (![0, 1, 2].includes(selected)) {
        onSelectTab({ selected: 0 });
      }
    }
  };
  useKeyListener(null, initData);
  useEffect(() => {
    initData();
  }, []);

  const onSelectTab = ({ selected }, dataItem) => {
    if (dataItem && dataItem._id) {
      props.history.push(`${props.location.pathname}?tab=${selected}&newspaper_id=${dataItem._id}`)
    } else {
      props.history.push(`${props.location.pathname}?tab=${selected}`)
    }
    setSelected(selected);
  };

  const onChangeNewspaper = (dataItem, callApi = true) => {
    if (callApi) {
      axios.put(`/newspapers/${dataItem._id}`, {
        _id: dataItem._id,
        name: dataItem.name,
        total_page: dataItem.total_page,
        offer_list: dataItem.offer_list,
        from: Math.round(dataItem.from.getTime() / 1000),
        to: Math.round(dataItem.to.getTime() / 1000),
        active: dataItem.active,
      })
        .then(response => {
          const newData = data.map(x => x._id === response.data.data._id ? {
            ...dataItem,
            from_date: startOfDay(dataItem.from),
            to_date: startOfDay(dataItem.to),
          } : x);
          setData(newData);

          props.closeDialog();
          props.showSuccessMessage();
        })
        .catch(e => {
        });
    } else {
      const newData = data.map(x => x._id === dataItem._id ? {
        ...dataItem,
        from_date: startOfDay(dataItem.from),
        to_date: startOfDay(dataItem.to),
      } : x);
      setData(newData);
    }
  };

  const onCreateNewspaper = (dataItem) => {
    axios.post(`/newspapers`, {
      name: dataItem.name,
      total_page: dataItem.total_page,
      offer_list: dataItem.offer_list,
      from: Math.round(dataItem.from.getTime() / 1000),
      to: Math.round(dataItem.to.getTime() / 1000),
      active: dataItem.active,
    })
      .then(response => {
        dataItem._id = response.data.data._id;
        const newData = [{
          ...dataItem,
          from_date: startOfDay(dataItem.from),
          to_date: startOfDay(dataItem.to),
        }, ...data];
        setData(newData);

        props.closeDialog();
        props.showSuccessMessage();
      })
      .catch(e => {
      });
  };

  const onDeleteNewspaper = (dataItem) => {
    axios.delete(`/newspapers/${dataItem._id}`)
      .then(response => {
        const newData = data.filter(x => {
          return x._id !== dataItem._id;
        });
        setData(newData);

        props.closeDialog();
        props.showSuccessMessage();
      }).catch(e => {
        props.closeDialog();
      });
  };

  return !data ? (
    <LoadingPanel />
  ) : (
    <TabStrip className='container-default' tabContentStyle={{ display: 'flex', flexDirection: 'column' }} selected={selected} onSelect={onSelectTab}>
      <TabStripTab title='Tilbudsavis'>
        <NewspaperGrid newspaperList={data}
          onChangeNewspaper={onChangeNewspaper} onCreateNewspaper={onCreateNewspaper} onDeleteNewspaper={onDeleteNewspaper} onChangeTab={(dataItem) => onSelectTab({ selected: 1 }, dataItem)} />
      </TabStripTab>
      <TabStripTab title='Tilbud'>
        <NewspaperOfferList newspaperList={data} onChangeNewspaper={(dataItem) => onChangeNewspaper(dataItem, false)} />
      </TabStripTab>
      <TabStripTab title='Liste'>
        <NewspaperProductList newspaperList={data} />
      </TabStripTab>
    </TabStrip>
  )
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      showSuccessMessage,
      closeDialog,
    },
    dispatch
  );
}
export default withRouter(connect(null, mapDispatchToProps)(NewspaperContent));
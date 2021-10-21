import { useEffect, useState, useRef } from 'react';
import axios from 'app/axios';
import { mapTree } from '@progress/kendo-react-treelist';
import { TabStrip, TabStripTab } from '@progress/kendo-react-layout';
import { bindActionCreators } from '@reduxjs/toolkit';
import { connect } from 'react-redux';
import CategoryTreeList from './tab/CategoryTreeList';
import CategoryTreeView from './tab/CategoryTreeView';
import { openDialog, closeDialog } from 'app/store/fuse/dialogSlice';
import ConfirmDialog from 'app/shared-components/ConfirmDialog';
import config from 'config/config';
import { parseUrlParams } from 'app/helper/general.helper';
import LoadingPanel from 'app/kendo/LoadingPanel';
import { withRouter } from 'react-router-dom';
import { showSuccessMessage, showErrorMessage } from 'app/store/fuse/messageSlice';
import { useSelector } from 'react-redux';
import { useKeyListener } from 'app/shared-components/KeyListener';
const subItemsField = 'items';

function CategoryContent(props) {
  const cache = useSelector(({ fuse }) => fuse.cache);
  const query = parseUrlParams(props.location.search);

  const [dataTree, setDataTree] = useState(null);
  const [selected, setSelected] = useState(+(query.tab ?? 0));
  const treeViewRef = useRef(null);

  const initData = () => {
    if (cache.categoryList) {
      let newData = cache.categoryList.map(x => { return { ...x } });
      let map = {};
      let dataTree = [];
      newData.forEach(item => {
        map[item._id] = item;
        if (item.parent_id) {
          if (!map[item.parent_id][subItemsField]) {
            map[item.parent_id][subItemsField] = [];
          }
          map[item.parent_id][subItemsField].push(item);
        } else {
          dataTree.push(item);
        }
      });
      setDataTree({ map, data: dataTree });
    } else {
      axios.get(`/categories/tree/null`, {})
        .then(({ data }) => {
          let newData = data.data.map(x => { return { ...x } });
          let map = {};
          let dataTree = [];
          newData.forEach(item => {
            map[item._id] = item;
            if (item.parent_id) {
              if (!map[item.parent_id][subItemsField]) {
                map[item.parent_id][subItemsField] = [];
              }
              map[item.parent_id][subItemsField].push(item);
            } else {
              dataTree.push(item);
            }
          });
          setDataTree({ map, data: dataTree });
        });
    }
  };
  useKeyListener(null, initData);

  useEffect(() => {
    if (![0, 1].includes(selected)) {
      onSelectTab({ selected: 0 });
    }
    initData();
  }, []);

  const handleYes = () => {
    if (treeViewRef.current) {
      treeViewRef.current.onSave();
    }
    setSelected(0);
    props.closeDialog();
  };

  const handleNo = () => {
    props.closeDialog();
  };

  const onSelectTab = ({ selected }) => {
    if (treeViewRef.current && treeViewRef.current.changedTree) {
      props.openDialog({
        children: (
          <ConfirmDialog title="Vil du gemme kategoriændringerne?" handleNo={() => handleNo()} handleYes={() => handleYes()} />
        )
      });
    } else {
      props.history.push(`${props.location.pathname}?tab=${selected}`);
      setSelected(selected)
    }
  };

  if (!dataTree) {
    return <LoadingPanel />
  } else {
    return (
      <>
        <TabStrip tabContentStyle={{ height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column' }} selected={selected} onSelect={onSelectTab}>
          <TabStripTab title='Liste'>
            <CategoryTreeList dataTree={dataTree.data} dataMap={dataTree.map} subItemsField={subItemsField} setDataTree={setDataTree} />
          </TabStripTab>
          <TabStripTab title='Omarranger'>
            <CategoryTreeView ref={treeViewRef} dataTree={dataTree.data} subItemsField={subItemsField} setDataTree={setDataTree} showSuccessMessage={props.showSuccessMessage} />
          </TabStripTab>
        </TabStrip>
      </>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      openDialog,
      closeDialog,
      showSuccessMessage,
      showErrorMessage
    },
    dispatch
  );
}
function mapStateToProps(state) {
  return {
    user: state.auth.user
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CategoryContent));
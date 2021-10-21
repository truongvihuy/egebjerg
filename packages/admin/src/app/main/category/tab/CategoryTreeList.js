import { useCallback, useEffect, useState } from 'react';
import axios from 'app/axios';
import {
  TreeList,
  orderBy,
  filterBy,
  mapTree,
  extendDataItem,
  TreeListTextFilter,
  TreeListNumericFilter,
  TreeListTextEditor,
  TreeListBooleanFilter,
  TreeListBooleanEditor,
} from '@progress/kendo-react-treelist';
import { withRouter } from 'react-router-dom';
import { showSuccessMessage, showErrorMessage } from 'app/store/fuse/messageSlice';
import { Checkbox } from '@progress/kendo-react-inputs';
import { IconButton, Icon } from '@material-ui/core';
import { openDialog, closeDialog } from 'app/store/fuse/dialogSlice';
import { bindActionCreators } from '@reduxjs/toolkit';
import { connect } from 'react-redux';
import CategoryForm from './CategoryForm';
import { getImageSrc, getPagePermission, MSG_NO_DATA } from 'app/constants';
import { TreeListActiveFilter } from 'app/kendo/CustomCell';
import { setIsUpdatingConfig } from 'app/auth/Auth';
import { cloneDeep } from 'lodash';
import { parseUrlParams } from 'app/helper/general.helper';
const expandField = 'expanded';

const initdataState = {
  sort: [{ field: 'order', dir: 'asc' }],
  filter: [],
};

const initData = {
  name: '',
  active: true,
  parent_id: null,
  order: 1,
};

function CategoryTreeList({
  dataTree,
  setDataTree,
  dataMap,
  subItemsField,
  pagePermission,
  openDialog,
  closeDialog,
  showSuccessMessage,
  showErrorMessage,
  location,
  history,
}) {
  const query = parseUrlParams(location.search);
  const initdataState = useCallback((query) => {
    let dataState = {
      sort: [{ field: 'order', dir: 'asc' }],
      filter: [],
    };
    Object.keys(query).map(key => {
      switch (key) {
        case '_id': {
          dataState.filter.push({
            field: key,
            operator: 'eq',
            value: +query[key],
          });
          break;
        }
        case 'name': {
          dataState.filter.push({
            field: key,
            operator: 'contains',
            value: query[key],
          });
          break;
        }
        case 'active': {
          let tmpValue = query[key] === 'true' ? true : query[key] === 'false' ? false : null;
          dataState.filter.push({
            field: key,
            operator: 'eq',
            value: tmpValue,
          });
          break;
        }
      }
    });

    return dataState;
  }, []);

  const [dataState, setDataState] = useState(initdataState(query));
  const [expanded, setExpanded] = useState([]);

  const processMapTree = (category) => {
    let newDataTree = {
      map: {},
      data: [],
    };
    newDataTree.data = mapTree(dataTree, subItemsField, item => {
      if (category && item._id === category._id) {
        newDataTree.map[category._id] = category;
        return category;
      }
      newDataTree.map[item._id] = item;
      return item;
    });

    return newDataTree;
  };

  useEffect(() => {
    let newDataState = initdataState(query);
    setDataState(newDataState);
  }, [location]);

  const add = dataItem => {
    setIsUpdatingConfig(true);
    axios.post(`/categories`, dataItem).then(response => {
      let newDataTree = {
        data: [],
        map: {},
      };
      let tmpDataItem = {
        ...response.data.data,
      };
      if (dataItem.parent_id) {
        let parentCategory = cloneDeep(dataMap[dataItem.parent_id]);
        parentCategory.children = [...(parentCategory.children ?? []), tmpDataItem._id];
        parentCategory.children_direct = [...(parentCategory.children_direct ?? []), tmpDataItem._id];
        parentCategory[subItemsField] = [...(parentCategory[subItemsField] ?? []), tmpDataItem];

        newDataTree = processMapTree(parentCategory);
      } else {
        newDataTree.data = cloneDeep(dataTree);
        newDataTree.map = cloneDeep(dataMap);
        newDataTree.data.push(tmpDataItem);
      }
      newDataTree.map[tmpDataItem._id] = tmpDataItem;
      setDataTree(newDataTree);

      showSuccessMessage();
      closeDialog();
    });
  };

  const update = async (newData, oldData) => {
    const newValue = {
      _id: newData._id,
      name: newData.name,
      active: newData.active,
      img: newData.img,
    };
    let result = false;

    const setActiveAllChildren = (item, activeStatus) => {
      if (item.items) {
        return {
          ...item,
          items: item.items.map(x => {
            return setActiveAllChildren(x, newData.active);
          }),
          active: activeStatus,
        };
      }

      return { ...item, active: activeStatus };
    };
    setIsUpdatingConfig(true);
    await axios
      .put(`/categories/${newValue._id}`, newValue)
      .then(response => {
        newData = response.data.data;
        //dataMap just use to render categoryTree so do not need to update active status
        let newDataTree = {
          map: {},
          data: [],
        };
        let tmpData = {
          ...newData,
          img: newData.img + `?t=${+new Date()}`,
          items:
            newData.active !== oldData.active
              ? item.items?.map(x => {
                return setActiveAllChildren(x, newData.active);
              })
              : item.items,
        };
        newDataTree = processMapTree(tmpData);
        setDataTree(newDataTree);

        showSuccessMessage();
        result = true;
      })
      .catch(error => {
        result = false;
      });
    return result;
  };

  const remove = dataItem => {
    setIsUpdatingConfig(true);
    axios.delete(`/categories/${dataItem._id}`).then(response => {
      let newDataTree = {
        data: [],
        map: {},
      };
      (dataItem.children ?? []).forEach(_id => delete newDataTree.map[_id]);

      if (dataItem.parent_id) {
        let parentCategory = cloneDeep(dataMap[dataItem.parent_id]);
        parentCategory.children = parentCategory.children.filter(_id => _id !== dataItem._id);
        parentCategory.children_direct = parentCategory.children_direct.filter(_id => _id !== dataItem._id);
        parentCategory[subItemsField] = parentCategory[subItemsField].filter(e => e._id !== dataItem._id);
        newDataTree = processMapTree(parentCategory);
      } else {
        newDataTree.data = cloneDeep(dataTree);
        newDataTree.map = cloneDeep(dataMap);
        newDataTree.data = newDataTree.data.filter(e => e._id !== dataItem._id);
        delete newDataTree.map[dataItem._id];
      }
      setDataTree(newDataTree);

      showSuccessMessage();
      closeDialog();
    });
  };

  const handleAdd = () => {
    if (!pagePermission.insert) {
      return;
    }

    openDialog({
      maxWidth: 'lg',
      children: <CategoryForm dataItem={{ ...initData }} dataTree={dataTree} dataMap={dataMap} cancel={closeDialog} onSubmit={add} closeDialog={closeDialog} showErrorMessage={showErrorMessage} showSuccessMessage={showSuccessMessage} />,
    });
  };

  const handleUpdate = dataItem => {
    if (!pagePermission.update) {
      return;
    }

    openDialog({
      children: <CategoryForm dataItem={dataItem} onSubmit={update} cancel={closeDialog} remove={remove} pagePermission={pagePermission} closeDialog={closeDialog} openDialog={openDialog} showErrorMessage={showErrorMessage} showSuccessMessage={showSuccessMessage} />,
    });
  };

  const onExpandChange = event => {
    const { dataItem } = event;
    setExpanded(dataItem[expandField] ? expanded.filter(id => id !== event.dataItem._id) : [...expanded, event.dataItem._id]);
  };

  const addExpandField = dataTree => {
    return mapTree(dataTree, subItemsField, item => {
      return extendDataItem(item, subItemsField, {
        [expandField]: dataState.filter.find(e => e.field === 'name')?.value || expanded.includes(item._id),
      });
    });
  };
  const processData = () => {
    let filterData = filterBy(dataTree, dataState.filter, subItemsField);
    filterData = orderBy(filterData, dataState.sort, subItemsField);
    return addExpandField(filterData);
  };

  function customNameCell(props) {
    const { dataItem, level } = props;
    const lastIndex = level.length - 1;
    return (
      <td
        onDoubleClick={() => handleUpdate(dataItem)}
        className='k-text-nowrap'
        colSpan={props.colSpan}
        aria-colindex={props.ariaColumnIndex}
        role='gridcell'
        style={{ display: 'flex', alignItems: 'center' }}>
        {level.map((_, index) => (
          <span
            key={index}
            className={`k-icon k-i-${index === lastIndex && props.hasChildren ? (props.expanded ? 'collapse' : 'expand') : 'none'}`}
            onClick={props.hasChildren ? e => props.onExpandChange(e, dataItem, props.level) : null}
          />
        ))}
        <img style={{ float: 'left', width: '50px', height: '50px' }} src={getImageSrc(dataItem.img, 0, true)} />
        <span style={{ paddingLeft: '10px' }}>{dataItem.name}</span>
      </td>
    );
  }
  function customActiveCell(props) {
    const { dataItem } = props;
    return (
      <td>
        <Checkbox checked={dataItem.active} onDoubleClick={() => handleRowClick({ dataItem })} />
      </td>
    );
  }

  const columns = [
    {
      field: '_id',
      title: 'ID',
      width: 150,
      filter: TreeListNumericFilter,
    },
    {
      field: 'name',
      title: 'Katalog',
      // width: 250,
      filter: TreeListTextFilter,
      expandable: true,
      editCell: TreeListTextEditor,
      cell: customNameCell,
    },
    {
      field: 'active',
      title: 'Aktiv',
      width: 100,
      filter: TreeListActiveFilter,
      editCell: TreeListBooleanEditor,
      cell: customActiveCell,
    },
  ];

  const hasValueFilter = () => {
    return dataState.filter?.length > 0;
  }

  const handleClearFilter = () => {
    setDataState({
      ...dataState,
      filter: [],
    });
  }

  const handleDataStateChange = (e) => {
    let urlParams = '';
    e.dataState.filter.forEach((filter, index) => {
      urlParams += `${index === 0 ? '?' : '&'}${filter.field}=${filter.value}`;
    });
    history.push({
      pathname: location.pathname,
      search: urlParams
    });
  }

  return (
    <>
      <div className='flex justify-between w-full pb-8'>
        <div className='flex'>
          {pagePermission.insert ? (
            <IconButton id='add-button' size='small' type='button' onClick={handleAdd} color='primary'>
              <Icon>add</Icon>
            </IconButton>
          ) : null}
        </div>
        <div className='flex'>
          <button style={{ alignSelf: 'flex-end' }}
            className={`k-button k-button-icon ${hasValueFilter() ? 'k-clear-button-visible' : ''}`}
            title='Clear'
            disabled={!hasValueFilter()}
            onClick={handleClearFilter}>
            <span className='k-icon k-i-filter-clear' />
          </button>
        </div>
      </div>

      <TreeList
        style={{ height: 'calc(100vh - 215px)', overflow: 'auto' }}
        {...dataState}
        data={processData()}
        dataItemKey='_id'
        expandField={expandField}
        subItemsField={subItemsField}
        columns={columns}
        onRowDoubleClick={({ dataItem }) => handleUpdate(dataItem)}
        onExpandChange={onExpandChange}
        onDataStateChange={handleDataStateChange}
        noRecords={MSG_NO_DATA}
      />
    </>
  );
}

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
    pagePermission: getPagePermission('category', auth.user),
    user: auth.user,
  };
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CategoryTreeList));

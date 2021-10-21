import React from 'react';
import { TreeView, TreeViewDragClue, processTreeViewItems, moveTreeViewItem, TreeViewDragAnalyzer } from '@progress/kendo-react-treeview';
import { Button } from '@material-ui/core';
import axios from 'app/axios';
import { setIsUpdatingConfig } from 'app/auth/Auth';
const SEPARATOR = '_';

const textField = 'name';

const CategoryTreeView = ({ dataTree, subItemsField, setDataTree, showSuccessMessage }, ref) => {
  const [data, setData] = React.useState(dataTree);
  const [expandTree1, setExpandTree1] = React.useState({
    ids: [],
    idField: '_id',
  });
  const [expandTree2, setExpandTree2] = React.useState({
    ids: [],
    idField: '_id',
  });
  const treeView1Guid = React.useRef();
  const treeView2Guid = React.useRef();
  const dragClue = React.useRef();
  let dragOverCnt = React.useRef(0);
  let isDragDrop = React.useRef(false);
  let changedTree = React.useRef(false);
  const [eventAnalyzer, setEvetAnalyzer] = React.useState(null);

  React.useImperativeHandle(ref, () => ({
    changedTree: changedTree.current,
    onSave: onClickSave,
  }));

  React.useEffect(() => {
    setData(dataTree);
  }, [dataTree]);

  const onExpandChange = (event) => {
    if (event.target.treeGuid === treeView1Guid.current.treeGuid) {
      let ids = expandTree1.ids.slice();
      const index = ids.indexOf(event.item._id);
      index === -1 ? ids.push(event.item._id) : ids.splice(index, 1);
      setExpandTree1({
        ids,
        idField: '_id',
      });
    } else {
      let ids = expandTree2.ids.slice();
      const index = ids.indexOf(event.item._id);
      index === -1 ? ids.push(event.item._id) : ids.splice(index, 1);
      setExpandTree2({
        ids,
        idField: '_id',
      });
    }
  };

  const forEachTreeCustom = (tree, subItemsField, callback, parent = null, level = 1) => {
    tree.forEach((node) => {
      callback(node, parent, level);
      if (Array.isArray(node[subItemsField])) {
        forEachTreeCustom(node[subItemsField], subItemsField, callback, node, level + 1);
      }
    });
  };

  const onChangeTree = (newTree) => {
    const categoryList = [];
    const mapList = {};
    let order = 1;
    forEachTreeCustom(newTree, subItemsField, (item, parent, level) => {
      let newValue = {
        _id: item._id,
        name: item.name,
        children_direct: (item[subItemsField] ?? null) && item[subItemsField].map((e) => e._id),
        parent_id: parent?._id ?? null,
        order: order++,
        level,
      };
      mapList[newValue._id] = newValue;
      categoryList.push(newValue);
    });
    for (let i = categoryList.length - 1; i > -1; i--) {
      let e = categoryList[i];
      e.children = (e.children_direct ?? []).reduce(
        (children, _id) => {
          return children.concat(mapList[_id].children);
        },
        [e._id],
      );
    }

    setIsUpdatingConfig(true);
    axios.put(`/categories`, categoryList).then(({ data }) => {
      let map = {};
      let dataTree = [];
      data.data.forEach((e) => {
        map[e._id] = e;
        if (e.parent_id) {
          if (!map[e.parent_id][subItemsField]) {
            map[e.parent_id][subItemsField] = [];
          }
          map[e.parent_id][subItemsField].push(e);
        } else {
          dataTree.push(e);
        }
      });
      setDataTree({ map, data: dataTree });

      showSuccessMessage();
    });
  };

  function getSiblings(itemIndex, data) {
    let result = data;
    const indices = itemIndex.split(SEPARATOR).map((index) => Number(index));

    for (let i = 0; i < indices.length - 1; i++) {
      result = result[indices[i]][subItemsField];
    }

    return result;
  }
  const getClueClassName = (eventAnalyzer) => {
    const { itemHierarchicalIndex: itemIndex } = eventAnalyzer.destinationMeta;

    if (eventAnalyzer.destTreeViewGuid === treeView1Guid.current.treeGuid) return 'k-i-cancel';
    if (eventAnalyzer.destinationMeta.itemHierarchicalIndex) {
      if (eventAnalyzer.destinationMeta.itemHierarchicalIndex.startsWith(eventAnalyzer.event.itemHierarchicalIndex)) return 'k-i-cancel';
    }

    if (eventAnalyzer.isDropAllowed) {
      switch (eventAnalyzer.getDropOperation()) {
        case 'child':
          return 'k-i-plus';
        case 'before':
          return itemIndex === '0' || itemIndex.endsWith(`${SEPARATOR}0`) ? 'k-i-insert-up' : 'k-i-insert-middle';
        case 'after':
          const siblings = getSiblings(itemIndex, data);
          const lastIndex = Number(itemIndex.split(SEPARATOR).pop());

          return lastIndex < siblings.length - 1 ? 'k-i-insert-middle' : 'k-i-insert-down';
        default:
          break;
      }
    }

    return 'k-i-cancel';
  };
  const onItemDragOver = (event) => {
    dragOverCnt.current++;
    const eventAnalyzer = new TreeViewDragAnalyzer(event).init();
    dragClue.current.show(event.pageY - 60, event.pageX - 300, event.item[textField], getClueClassName(eventAnalyzer));
    setEvetAnalyzer(eventAnalyzer);
  };
  const onItemDragEnd = (event) => {
    isDragDrop.current = dragOverCnt.current > 0;
    dragOverCnt.current = 0;
    dragClue.current.hide();

    const eventAnalyzer = new TreeViewDragAnalyzer(event).init();

    if (eventAnalyzer.isDropAllowed && eventAnalyzer.destTreeViewGuid === treeView2Guid.current.treeGuid) {
      const { sourceData } = moveTreeViewItem(
        event.itemHierarchicalIndex,
        data,
        eventAnalyzer.getDropOperation(),
        eventAnalyzer.destinationMeta.itemHierarchicalIndex,
        data,
        subItemsField,
      );
      setData(sourceData);
      changedTree.current = true;
    }
    setEvetAnalyzer(null);
  };

  const onClickSave = () => {
    changedTree.current = false;
    onChangeTree(data);
  };

  const processData = (idTree) => {
    return processTreeViewItems(data, {
      expand: idTree === 'tree1' ? expandTree1 : expandTree2,
      childrenField: subItemsField,
    });
  };

  const customItem = (props) => {
    let style = { padding: '4px', margin: '-4px -8px' };
    if (
      eventAnalyzer &&
      treeView2Guid &&
      eventAnalyzer.destTreeViewGuid === treeView2Guid.current.treeGuid &&
      props.itemHierarchicalIndex === eventAnalyzer.destItemId
    ) {
      switch (eventAnalyzer.getDropOperation()) {
        case 'child':
          style.border = '1px solid #252f3e';
          break;
        case 'before':
          style.borderTop = '1px solid #252f3e';
          break;
        case 'after':
          style.borderBottom = '1px solid #252f3e';
          break;
        default:
      }
    }
    return <div style={style}>{props.item.name}</div>;
  };

  return (
    <>
      <div>
        <Button style={{ margin: '10px' }} variant="contained" color="primary" onClick={onClickSave}>
          Gem
        </Button>
      </div>
      <div className="tree-view">
        <TreeView
          className="cat-tree-view-in-form"
          data={processData('tree1')}
          textField={textField}
          childrenField={subItemsField}
          expandIcons
          onExpandChange={onExpandChange}
          ref={treeView1Guid}
          draggable
          onItemDragOver={onItemDragOver}
          onItemDragEnd={onItemDragEnd}
        />
        <TreeView
          className="cat-tree-view-in-form ml-80"
          data={processData('tree2')}
          item={customItem}
          textField={textField}
          childrenField={subItemsField}
          expandIcons
          onExpandChange={onExpandChange}
          ref={treeView2Guid}
          draggable
          onItemDragOver={onItemDragOver}
          onItemDragEnd={onItemDragEnd}
        />
        <TreeViewDragClue ref={dragClue} />
      </div>
    </>
  );
};

export default React.forwardRef(CategoryTreeView);

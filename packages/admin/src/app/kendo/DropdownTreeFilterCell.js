import React, { useEffect } from "react";
import * as ReactDOM from "react-dom";
import { DropDownTree } from "@progress/kendo-react-dropdowns";
import { filterBy } from "@progress/kendo-react-data-tools";
import { mapTree, extendDataItem } from "@progress/kendo-react-common";

const processTreeData = (data, state, fields) => {
  const { selectField, expandField, dataItemKey, subItemsField } = fields;
  const { expanded, value, filter } = state;
  const filtering = Boolean(filter && filter.value);

  return mapTree(
    filtering ? filterBy(data, [filter], subItemsField) : data,
    subItemsField,
    (item) => {
      const props = {
        [expandField]: expanded.includes(item[dataItemKey]),
        [selectField]: value && item[dataItemKey] === value[dataItemKey],
      };
      return filtering
        ? extendDataItem(item, subItemsField, props)
        : { ...item, ...props };
    }
  );
};

const expandedState = (item, dataItemKey, expanded) => {
  const nextExpanded = expanded.slice();
  const itemKey = item[dataItemKey];
  const index = expanded.indexOf(itemKey);
  index === -1 ? nextExpanded.push(itemKey) : nextExpanded.splice(index, 1);

  return nextExpanded;
};
const DropdownTreeFilterCell = (props) => {
  const selectField = props.selectField ?? 'selected';
  const expandField = props.expandField ?? 'expanded';
  const dataItemKey = props.dataItemKey ?? '_id';
  const textField = props.textField ?? 'name';
  const subItemsField = props.subItemsField ?? 'items';
  const fields = {
    selectField,
    expandField,
    dataItemKey,
    subItemsField,
  };
  const id = props.id ?? 'dropdowntree-filter';
  const [dataTree, setDataTree] = React.useState();
  const [expanded, setExpanded] = React.useState([]);

  useEffect(() => {
    if (typeof dataTree == 'undefined') {
      let map = {};
      let dataTree = [];
      let data = [];
      let value = null;
      props.data.forEach(x => {
        if (props.value && x._id == props.value) {
          value = { ...x };
        }
        data.push({ ...x })
      })
      data.forEach(item => {
        map[item._id] = item;
        if (item.parent_id) {
          if (!map[item.parent_id][subItemsField]) {
            map[item.parent_id][subItemsField] = [];
          }
          map[item.parent_id][subItemsField].push(item);
        }
      });
      data.forEach(item => {
        if (!item.parent_id) {
          dataTree.push({ ...map[item._id] });
        }
      });
      setDataTree({ map, dataTree });
      if (value) {
        let newExpanded = [...expanded, value.parent_id];
        while (map[value.parent_id]) {
          value = map[value.parent_id];
          newExpanded.push(value.parent_id);
        }
        setExpanded(newExpanded);
      }
    }
  }, [])

  useEffect(() => {
    function handlePress(e) {
      if (e.which === 27) {
        setValue(null);
        props.onChange({
          value: '',
          operator: '',
        });
      }
    }
    let component = document.getElementById(id);
    if (dataTree) {
      if (component) {
        component.addEventListener('keydown', handlePress)
      }
    }
    return () => {
      if (component) {
        component.removeEventListener('keydown', handlePress)
      }
    }
  }, [dataTree])
  const [value, setValue] = React.useState(props.data.find(x => x[dataItemKey] == props.value));
  const [filter, setFilter] = React.useState();

  const onChange = (event) => {
    document.getElementById(id).focus();
    setValue(event.value);
    props.onChange({
      value: event.value ? event.value._id : '',
      operator: event.value ? 'eq' : '',
      syntheticEvent: event.syntheticEvent
    });
  }

  const onExpandChange = React.useCallback(
    (event) => setExpanded(expandedState(event.item, dataItemKey, expanded)),
    [expanded]
  );
  const treeData = React.useMemo(
    () => {
      if (dataTree) {
        let data = processTreeData(
          dataTree.dataTree,
          {
            expanded,
            value,
            filter,
          },
          fields
        )
        if (filter && filter.value != '') {
          let newExpanded = [...expanded];
          data.forEach(x => {
            if (x.items) {
              newExpanded.push(x._id);
            }
          })
          data = processTreeData(
            dataTree.dataTree,
            {
              expanded: newExpanded,
              value,
              filter,
            },
            fields
          )
        }
        return data;
      } else {
        return [];
      }
    },
    [expanded, value, filter, dataTree]
  );

  const onFilterChange = (event) => setFilter(event.filter);
  if (dataTree) {
    return (
      <DropDownTree
        id={id}
        style={{ width: '100%' }}
        data={treeData}
        value={value}
        onChange={onChange}
        textField={textField}
        dataItemKey={dataItemKey}
        selectField={selectField}
        expandField={expandField}
        onExpandChange={onExpandChange}
        filterable={true}
        onFilterChange={onFilterChange}
      />
    );
  }
  return null;
};
export default DropdownTreeFilterCell;
import { filterBy } from "@progress/kendo-react-data-tools";
import { mapTree, extendDataItem } from "@progress/kendo-react-common";

export const processMultiSelectTreeData = (data, state, fields) => {
  const { checkField, expandField, dataItemKey, subItemsField, checkIndeterminateField } = fields;
  const { expanded, value, filter } = state;
  const filtering = Boolean(filter && filter.value);
  const valueIdList = value.map(x => x[dataItemKey]);
  return mapTree(
    filtering ? filterBy(data, [filter], subItemsField) : data,
    subItemsField,
    (item) => {
      let checkIndeter = false;
      if (!valueIdList.includes(item._id)) {
        for (let i = 0; i < valueIdList.length; i++) {
          if (item.children.includes(valueIdList[i])) {
            checkIndeter = true;
            break;
          }
        }
      }
      const props = {
        [expandField]: expanded.includes(item[dataItemKey]),
        [checkField]: valueIdList.length > 0 && valueIdList.includes(item[dataItemKey]),
        [checkIndeterminateField]: checkIndeter
      };
      return filtering
        ? extendDataItem(item, subItemsField, props)
        : { ...item, ...props };
    }
  );
};

export const expandedState = (item, dataItemKey, expanded) => {
  const nextExpanded = expanded.slice();
  const itemKey = item[dataItemKey];
  const index = expanded.indexOf(itemKey);
  index === -1 ? nextExpanded.push(itemKey) : nextExpanded.splice(index, 1);

  return nextExpanded;
};
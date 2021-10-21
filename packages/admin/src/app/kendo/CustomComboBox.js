import { useEffect, useState } from 'react';
import { ComboBox } from '@progress/kendo-react-dropdowns';
import { filterBy } from '@progress/kendo-data-query';

const CustomCombobox = (props) => {
  const [options, setOption] = useState([]);

  useEffect(() => {
    setOption(props.data.slice())
  }, [props.data]);

  const filterData = (filter) => {
    const options = props.data.slice();
    return filterBy(options, filter);
  };

  const filterChange = (event) => {
    setOption(filterData(event.filter));
  };

  return (
    <ComboBox className={props.className} style={props.style} data={options} clearButton={props.clearButton} onOpen={props.onOpen}
      textField={props.textField} filterable={props.filterable} suggest={props.suggest} label={props.label}
      onFilterChange={props.filterable ? filterChange : null} onChange={props.onChange}
      value={props.value} defaultItem={props.defaultItem} />
  )
};

export default CustomCombobox;
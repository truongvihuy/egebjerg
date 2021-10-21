import { useState, useEffect } from 'react';
import { Input } from '@progress/kendo-react-inputs';
import { PRODUCT_STATUS } from 'app/constants';
import { DropDownList, ComboBox } from '@progress/kendo-react-dropdowns';
import CheckBox from '@material-ui/core/Checkbox';
import { MultiSelect } from '@progress/kendo-react-dropdowns';
import { DatePicker } from '@progress/kendo-react-dateinputs';
import { Icon, IconButton } from '@material-ui/core';
import { formatCurrency, formatNumber } from 'app/helper/general.helper';
import { format, startOfDay } from 'date-fns';

const onClearButtonClick = (e, props, setValue) => {
  e.preventDefault();
  setValue('');
  props.onChange({
    value: '',
    operator: '',
    syntheticEvent: e,
  });
};

const handleKeyUp = (e, props, setValue, hasValue, operator, type = 'string') => {
  if (e.which === 27) {
    //Esc
    onClearButtonClick(e, props, setValue);
  } else if (e.which === 13) {
    //Enter
    e.preventDefault();
    hasValue = hasValue(e.target.value);
    props.onChange({
      value: hasValue ? (type == 'number' ? parseFloat(e.target.value) : e.target.value) : '',
      operator: hasValue ? operator : '',
      syntheticEvent: e.syntheticEvent,
    });
  }
};

const handleOnChange = (e, setValue, type = 'string') => {
  setValue(type == 'number' ? parseFloat(e.target.value) : e.target.value);
};

// https://www.telerik.com/kendo-react-ui/components/grid/filtering/#toc-custom-filter-cells
export const DropdownFilterCell = props => {
  let hasValue = value => typeof value !== 'undefined' && value;
  const [value, setValue] = useState(props.value ? props.data.find(x => x._id === props.value || x.value === props.value) : null);
  let id = props.id ?? 'dropdown-filter';
  useEffect(() => {
    let component = document.getElementById(id);
    if (component) {
      component.addEventListener('keydown', handlePress);
    }
    function handlePress(e) {
      if (e.which === 27) {
        setValue(null);
        props.onChange({
          value: '',
          operator: '',
        });
      }
    }
    return () => component.removeEventListener('keydown', handlePress);
  }, [value]);

  useEffect(() => {
    if ((value?.value ?? value?._id ?? null) !== props.value) {
      if (hasValue(props.value)) {
        setValue(props.data.find(e => (e.value ?? e._id) === props.value));
      } else {
        setValue(null);
      }
    }
  }, [props.value, props.data]);

  const onChange = event => {
    setValue(event.value);
    let isHasValue = hasValue(event.value);
    props.onChange({
      value: isHasValue ? event.value._id ?? event.value.value : '',
      operator: isHasValue ? event.value.operator ?? 'eq' : '',
      syntheticEvent: event.syntheticEvent,
    });
  };

  const onClearButtonClick = event => {
    event.preventDefault();
    setValue(null);
    props.onChange({
      value: '',
      operator: '',
      syntheticEvent: event,
    });
  };

  return (
    <div className="k-filtercell">
      {props.type == 'dropdown' ? (
        <DropDownList
          id={id}
          suggest={true}
          textField={props.textField ?? 'name'}
          data={props.data}
          onChange={onChange}
          value={value}
          defaultItem={props.defaultItem}
        />
      ) : (
        <ComboBox
          id={id}
          suggest={true}
          textField={props.textField ?? 'name'}
          data={props.data}
          onChange={onChange}
          value={value}
          defaultItem={props.defaultItem}
        />
      )}
    </div>
  );
};

export const CheckboxFilterCell = props => {
  let hasValue = value => Boolean(value && value !== props.defaultItem);
  const [value, setValue] = useState(null);

  const onClearButtonClick = event => {
    props.onClear();
  };

  return (
    <div className="k-filtercell">
      {props.data.map((x, i) => {
        return (
          <div key={i}>
            <span>{x.name}</span>
            <CheckBox
              checked={props.value[x._id] ?? false}
              onChange={e => {
                props.onChange(x._id, e);
              }}
            />
          </div>
        );
      })}
      <button
        className={`k-button k-button-icon ${hasValue(props.value) ? 'k-clear-button-visible' : ''}`}
        title="Clear"
        disabled={!hasValue(props.value)}
        onClick={onClearButtonClick}>
        <span className="k-icon k-i-filter-clear" />
      </button>
    </div>
  );
};

export const MultiSelectFilterCell = props => {
  let hasValue = value => Boolean(value && value !== props.defaultItem);
  const [value, setValue] = useState(props.value);
  let id = props.id ?? 'multiselect-filter';
  useEffect(() => {
    let component = document.getElementById(id);
    if (component) {
      component.addEventListener('keydown', handlePress);
    }
    function handlePress(e) {
      if (e.which === 27 && e.target && e.target.tagName == 'INPUT') {
        setValue([]);
        props.onClear();
      }
    }
    return () => component.removeEventListener('keydown', handlePress);
  }, []);

  return (
    <div className="k-filtercell">
      <MultiSelect
        id={id}
        value={value}
        data={props.data}
        onChange={e => {
          setValue(e.value);
          props.onChange(e);
          document.getElementById(id).focus();
        }}
        textField="name"
        dataItemKey="_id"
        tagRender={(e, inputProp) => {
          return {
            ...inputProp,
            props: {
              ...inputProp.props,
              style: {
                padding: 0,
                border: 0,
                backgroundColor: '#FFFFFF',
              },
              children: e.data.map(x => <span key={x._id}>{x.tag}</span>),
            },
          };
        }}
      />
    </div>
  );
};

const options = [
  { text: '(Alle)', value: null },
  { text: 'Aktiv', value: true },
  { text: 'Inaktiv', value: false },
];

export const ActiveFilterCell = props => {
  let hasValue = value => typeof value === 'boolean';
  const [value, setValue] = useState(typeof props.value === 'boolean' ? options.find(e => e.value === props.value) : null);

  let id = props.id ?? 'active-filter';
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
    if (component) {
      component.addEventListener('keydown', handlePress);
    }
    return () => component.removeEventListener('keydown', handlePress);
  }, []);

  useEffect(() => {
    if ((value?.value ?? null) !== props.value) {
      if (hasValue(props.value)) {
        setValue(options.find(e => e.value === props.value));
      } else {
        setValue(null);
      }
    }
  }, [props.value]);

  const onChange = event => {
    hasValue = hasValue(event.value.value);
    setValue(event.value);
    props.onChange({
      value: hasValue ? event.value._id ?? event.value.value : '',
      operator: hasValue ? 'eq' : '',
      syntheticEvent: event.syntheticEvent,
    });
  };

  const onClearButtonClick = event => {
    event.preventDefault();
    setValue(null);
    props.onChange({
      value: '',
      operator: '',
      syntheticEvent: event,
    });
  };

  return (
    <div className="k-filtercell">
      <DropDownList id={id} textField="text" data={options} onChange={onChange} value={value} />
    </div>
  );
};

export const TreeListActiveFilter = props => {
  const initValue = () => {
    let filterItem = props.filter.find(filterEle => filterEle.field === props.field);
    if (filterItem) {
      return options.find(option => filterItem.value === option.value) ?? null;
    }
    return null;
  }
  const [value, setValue] = useState(initValue());
  let hasValue = value => Boolean(value && typeof value.value === 'boolean');

  const onChange = event => {
    const filter = props.filter.filter(e => e.field !== props.field);
    if (typeof event.value.value === 'boolean') {
      filter.push({
        value: event.value.value,
        field: props.field,
        operator: 'eq',
      });
    }
    setValue(event.value);
    props.onFilterChange({
      field: props.field,
      filter,
      syntheticEvent: event.syntheticEvent,
    });
  };

  const onClearButtonClick = event => {
    event.preventDefault();
    setValue(null);
    const filter = props.filter.filter(e => e.field !== props.field);
    props.onFilterChange({
      field: props.field,
      filter,
      syntheticEvent: event,
    });
  };

  return (
    <div className="k-filtercell">
      <DropDownList textField="text" data={options} onChange={onChange} value={value} />
      <button
        className={`k-button k-button-icon ${hasValue(value) ? 'k-clear-button-visible' : ''}`}
        title="Clear"
        disabled={!hasValue(value)}
        onClick={onClearButtonClick}>
        <span className="k-icon k-i-filter-clear" />
      </button>
    </div>
  );
};

export const ActiveCell = props => {
  return (
    <td>
      <CheckBox checked={props.dataItem.active} disabled />
    </td>
  );
};

export const ProductActiveCell = props => {
  let statusText = props.dataItem.status === PRODUCT_STATUS.inactiveOffer ? 'I&T' : PRODUCT_STATUS.activeOffer === 3 ? 'A&T' : '';
  return (
    <td>
      {props.dataItem.status > PRODUCT_STATUS.associated && (
        <>
          <CheckBox checked={props.dataItem.status > 0} disabled /> {statusText}
        </>
      )}
    </td>
  );
};

export const ProductActiveValue = ({ status }) => {
  let statusText = status === PRODUCT_STATUS.inactiveOffer ? 'I&T' : status === PRODUCT_STATUS.activeOffer ? 'A&T' : '';
  return (
    status > PRODUCT_STATUS.associated && (
      <>
        <CheckBox size="small" checked={status > 0} disabled /> {statusText}
      </>
    )
  );
};

export const PriceCell = ({ number, displayCurrency = true, props = {} }) => (
  <td {...props} style={{ textAlign: 'right' }}>
    {formatCurrency(number, displayCurrency)}
  </td>
);
export const WeightCell = ({ number }) => <td style={{ textAlign: 'right' }}>{formatNumber(number / 1000)}kg.</td>;

export const ItemNumberCell = propsCell => {
  return (
    <td>
      <div className="text-center">
        {propsCell.dataItem.item_number.flatMap((number, index) => {
          return number ? <p key={`${propsCell.dataItem._id}_${index}`}>{number}</p> : [];
        })}
        {propsCell.dataItem._id > 0 && <p style={{ fontSize: 11, color: 'secondary', marginTop: 5 }}>#{propsCell.dataItem._id}</p>}
      </div>
    </td>
  );
};

export const ItemNumberCellInCustomDiv = ({ dataItem, style = {} }) => {
  return (
    <div className="text-center" style={style}>
      {dataItem?.item_number?.flatMap((number, index) => {
        return number ? <p key={`${dataItem._id}_${index}`}>{number}</p> : [];
      })}
      {dataItem._id > 0 && <p style={{ fontSize: 11, color: 'secondary', marginTop: 5 }}>#{dataItem._id}</p>}
    </div>
  );
};

export const NumberFilterCell = props => {
  let hasValue = value => Boolean(value && value !== props.defaultItem);
  const [value, setValue] = useState(props.value);

  useEffect(() => {
    if (value !== props.value) {
      setValue(props.value);
    }
  }, [props.value]);

  return (
    <div className="k-filtercell">
      <Input
        type="number"
        style={{ width: '100%', marginRight: '3px' }}
        value={value ?? ''}
        onChange={e => {
          if (e.nativeEvent.constructor.name == 'InputEvent' && e.nativeEvent.inputType == 'insertText' && e.nativeEvent.data == '.') {
            return;
          }
          handleOnChange(e, setValue, 'number');
        }}
        onKeyUp={e => handleKeyUp(e, props, setValue, hasValue, 'eq', 'number')}
      />
    </div>
  );
};

export const TextFilterCell = props => {
  let hasValue = value => Boolean(value && value !== props.defaultItem);
  const [value, setValue] = useState(props.value);

  useEffect(() => {
    if (value !== props.value) {
      setValue(props.value);
    }
  }, [props.value]);

  return (
    <div className="k-filtercell">
      <Input
        style={{ width: '100%', marginRight: '3px' }}
        value={value}
        placeholder={props.placeholder ?? ''}
        onChange={e => handleOnChange(e, setValue)}
        onKeyUp={e => handleKeyUp(e, props, setValue, hasValue, 'contains')}
      />
    </div>
  );
};

export const DateFilterCell = props => {
  let hasValue = value => !!value;
  const [value, setValue] = useState(props.value);

  useEffect(() => {
    if (value !== props.value) {
      setValue(props.value);
    }
  }, [props.value]);

  const onChange = event => {
    setValue(event.value);
    let isHasValue = hasValue(event.value);
    if (isHasValue) {
      props.onChange({
        value: startOfDay(event.value),
        operator: 'eq',
        syntheticEvent: event.syntheticEvent,
      });
    }
  };

  return (
    <div className="k-filtercell">
      <DatePicker value={value} onChange={onChange} />
      <button
        className={`k-button k-button-icon ${hasValue(props.value) ? 'k-clear-button-visible' : ''}`}
        title="Clear"
        disabled={!hasValue(props.value)}
        onClick={e => onClearButtonClick(e, props, setValue)}>
        <span className="k-icon k-i-filter-clear" />
      </button>
    </div>
  );
};

export const GridToolbarCustom = ({ dataState, insert = false, handleAdd, leftComponent, rightComponent, clearFilter = true, onClearChange }) => {
  const hasValueFilter = () => {
    return dataState.filter?.filters.length > 0;
  };

  useEffect(() => {
    function handlePress(e) {
      if (e.which === 119) {
        e.preventDefault();
        let ele = document.getElementById('k-clear-all-filter');
        ele.click();
      }
    }
    window.addEventListener('keydown', handlePress);
    return () => window.removeEventListener('keydown', handlePress);
  }, []);

  const handleClearFilter = () => {
    let newDataState = {
      ...dataState,
      skip: 0,
      filter: {
        filters: [],
        logic: 'and',
      },
    };
    onClearChange({ dataState: newDataState });
  };

  return (
    <div className="flex w-full">
      <div className="flex gap-5">
        {insert && (
          <IconButton id="add-button" size="small" type="button" onClick={handleAdd} color="primary">
            <Icon fontSize="small">add</Icon>
          </IconButton>
        )}
        {leftComponent}
      </div>

      <div className="flex gap-3 ml-auto">
        {rightComponent}
        {clearFilter && (
          <button
            id="k-clear-all-filter"
            style={{ alignSelf: 'flex-end' }}
            className={`k-button k-button-icon ${hasValueFilter() ? 'k-clear-button-visible' : ''}`}
            title="Clear"
            disabled={!hasValueFilter()}
            onClick={handleClearFilter}>
            <span className="k-icon k-i-filter-clear" />
          </button>
        )}
      </div>
    </div>
  );
};

export const CustomPaging = ({ className, total, skip, take, onPageChange, pageSizes, previousNext, buttonCount, ...props }) => {
  let page = ((skip / take) | 0) + 1;
  let totalPage = Math.ceil(total / take);
  const startPage = (Math.ceil(page / buttonCount) - 1) * buttonCount + 1;
  const arrayPage = [];
  for (let i = startPage; i <= totalPage && i < startPage + buttonCount; i++) {
    arrayPage.push(i);
  }
  if (totalPage === 0) {
    page = 0;
  }

  const handleOnChangePageSizes = e => {
    if (onPageChange) {
      onPageChange({
        target: e.target,
        skip: 0,
        take: e.value,
        syntheticEvent: e.syntheticEvent,
        nativeEvent: e.nativeEvent,
      });
    }
  };

  const handlePageChange = (e, pageValue) => {
    e.preventDefault();
    if (onPageChange) {
      onPageChange({
        target: e.target,
        skip: (pageValue - 1) * take,
        take,
        syntheticEvent: e,
        nativeEvent: e,
      });
    }
  };

  return (
    <div className={`${className} k-pager-wrap k-widget k-grid-pager`} role="navigation">
      {previousNext && (
        <>
          <a
            href="#"
            onClick={e => handlePageChange(e, 1)}
            className={`k-link k-pager-nav k-pager-first ${page <= 1 ? 'k-state-disabled' : ''}`}
            title="Go to the first page">
            <span className="k-icon k-i-arrow-end-left" aria-label="Go to the first page" />
          </a>
          <a
            href="#"
            onClick={e => handlePageChange(e, page - 1)}
            className={`k-link k-pager-nav ${page <= 1 ? 'k-state-disabled' : ''}`}
            title='Go to the previous page"'>
            <span className="k-icon k-i-arrow-60-left" aria-label='Go to the previous page"' />
          </a>
        </>
      )}
      <div className="k-pager-numbers-wrap">
        <ul className="k-pager-numbers k-reset">
          {arrayPage[0] && arrayPage[0] !== 1 && (
            <li>
              <a href="#" onClick={e => handlePageChange(e, arrayPage[0] - buttonCount)} className={`k-link`}>
                ...
              </a>
            </li>
          )}
          {arrayPage.map((value, index) => (
            <li key={index}>
              <a href="#" onClick={e => handlePageChange(e, value)} className={`k-link ${page === value ? 'k-state-selected' : ''}`}>
                {value}
              </a>
            </li>
          ))}
          {arrayPage[arrayPage.length - 1] && arrayPage[arrayPage.length - 1] !== totalPage && (
            <li>
              <a href="#" onClick={e => handlePageChange(e, arrayPage[arrayPage.length - 1] + 1)} className={`k-link`}>
                ...
              </a>
            </li>
          )}
        </ul>
      </div>
      {previousNext && (
        <>
          <a
            href="#"
            onClick={e => handlePageChange(e, page + 1)}
            className={`k-link k-pager-nav ${page === totalPage ? 'k-state-disabled' : ''}`}
            title="Go to the next page">
            <span className="k-icon k-i-arrow-60-right" aria-label="Go to the next page" />
          </a>
          <a
            href="#"
            onClick={e => handlePageChange(e, totalPage)}
            className={`k-link k-pager-nav k-pager-last ${page === totalPage ? 'k-state-disabled' : ''}`}
            title="Go to the last page">
            <span className="k-icon k-i-arrow-end-right" aria-label="Go to the last page" />
          </a>
        </>
      )}

      <div className="k-pager-info k-label" style={{ marginRight: 0 }}>
        Side {page} / {totalPage} | {total}
        <DropDownList data={pageSizes} value={take} onChange={handleOnChangePageSizes} style={{ width: '75px', marginLeft: '1em' }} />
      </div>
    </div>
  );
};

export const StatusFilterCell = propsFilter => {
  const options = [
    { name: '(Alle)', _id: '' },
    { name: 'Inaktiv', _id: 0 },
    { name: 'Inaktiv (Tilbud)', _id: 2 },
    { name: 'Aktiv', _id: 1 },
    { name: 'Aktiv (Tilbud)', _id: 3 },
    { name: 'Associeret', _id: -1 },
  ];
  return <DropdownFilterCell id="status-filter" {...propsFilter} data={options} type="dropdown" />;
};

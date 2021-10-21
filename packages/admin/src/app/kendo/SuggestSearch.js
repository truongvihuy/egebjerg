import { useEffect, useRef, useState } from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { TextField, InputAdornment, CircularProgress } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { SEARCH_DELAY_TIME } from 'app/constants';

const SuggestSearch = (props) => {
  // const [focus, setFocus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [textSearch, setTextSearch] = useState('');
  const [options, setOptions] = useState([]);
  const timer = useRef(null);
  const noOption = useRef(false);

  useEffect(() => {
    return () => {
      clearTimeout(timer.current);
      timer.current = null;
    };
  }, []);


  return (
    <Autocomplete id={props.id}
      freeSolo
      options={options}
      autoHighlight
      fullWidth={props.fullWidth}
      renderTags={(value) => null}
      noOptionsText={<div>no option</div>}
      renderInput={(params) => {
        return (
          <TextField
            {...params}
            inputProps={{
              ...params.inputProps,
              value: textSearch
            }}
            placeholder={props.placeholder}
            name={props.name}
            variant='standard'
            label={props.label}
            // onBlur={e => {
            //   setFocus(false);
            // }}
            // onFocus={e => {
            //   setFocus(true);
            // }}
            onChange={(event) => {
              noOption.current = false;
              setTextSearch(event.target.value);
              if (timer.current) {
                clearTimeout(timer.current);
                timer.current = null;
              }
              if (event.target.value.length) {
                if (!loading) {
                  setLoading(true);
                }
                timer.current = setTimeout(() => {
                  props.onSearch(event, (options) => {
                    if (options.length === 0) {
                      noOption.current = true;
                    }
                    setOptions(options);
                    setLoading(false);
                  });
                }, SEARCH_DELAY_TIME);
              } else {
                setLoading(false);
              }
            }}
            InputProps={{
              ...params.InputProps,
              startAdornment: props.iconSearch ? (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ) : null,
              endAdornment: loading ? <CircularProgress size={15} /> : (noOption.current && <div style={{ color: 'red' }}>ikke fundet</div>),
            }}
            error={props.error} helperText={props.helperText}
          />
        )
      }}
      getOptionLabel={props.getOptionLabel}
      renderOption={props.renderOption}
      disableClearable
      filterOptions={options => options}
      onChange={(_, value, action) => {
        if (action === 'select-option' && value) {
          setOptions([]);
          setTextSearch('');
          props.onChange(value);
        }
      }}
    />
  )
};

SuggestSearch.defaultProps = {
  iconSearch: true,
  delayTime: SEARCH_DELAY_TIME,
};
export default SuggestSearch;
import {
  SEARCH_DELAY_TIME,
  PLACEHOLDER_CUSTOMER,
  MSG_DO_NOT_HAVE_SAVED_CARD,
  PAYMENT_METHOD,
  WARNING_CREDIT_LIMIT,
} from 'app/constants';
import { Autocomplete } from '@material-ui/lab';
import { useRef, useState } from 'react';
import { CircularProgress, TextField, IconButton, Icon, InputAdornment } from '@material-ui/core';
import axios from 'app/axios';
import { debounce } from 'lodash';

export const CustomerInput = ({
  className,
  label,
  style,
  onChange,
  value,
  id,
  disableClearable,
  customerType,
  multiple = false,
  autoFocus = false,
  isCreatingOrder = false,
}) => {
  const [options, setOptions] = useState([]);
  const [focus, setFocus] = useState(false);
  const [loading, setLoading] = useState(false);
  const keyword = useRef(null);
  const handleClear = params => {
    params.inputProps.onChange({
      target: {
        value: '',
      },
    });
    if (!disableClearable) {
      if (multiple) {
        onChange([]);
      } else {
        onChange(undefined);
      }
    }
  };

  let requestSource = null;

  //https://medium.com/@nhduy88/s%E1%BB%AD-d%E1%BB%A5ng-ajax-v%E1%BB%9Bi-vuejs-axios-lodash-b%E1%BB%8F-qua-request-tr%C6%B0%E1%BB%9Bc-delay-tr%C6%B0%E1%BB%9Bc-khi-g%E1%BB%ADi-request-2b19233f98a
  //https://github.com/axios/axios#cancellation
  const makeRequest = debounce(params => {
    const source = axios.CancelToken.source();
    cancelRequest();
    requestSource = source;

    setLoading(true);
    axios
      .get('/customers', { params, cancelToken: source.token })
      .then(response => {
        setLoading(false);
        setOptions(response.data.data.customer_list);
      })
      .catch(e => {
        if (axios.isCancel(e)) {
          console.log('Request canceled 1', thrown.message);
        } else {
          // handle error
        }
        setLoading(false);
        setOptions([]);
      });
  }, SEARCH_DELAY_TIME);

  const cancelRequest = () => {
    if (requestSource !== null) {
      requestSource.cancel('Cancel request');
    }
  };

  return (
    <>
      <Autocomplete
        id={id}
        className={className}
        style={style}
        renderTags={value => null}
        open={options?.length > 0 && focus}
        multiple={multiple}
        options={options}
        value={value}
        autoHighlight
        freeSolo
        disableClearable={disableClearable}
        filterOptions={options => options}
        getOptionLabel={option => (option._id && option.name ? option.name : '')}
        renderOption={option => {
          return (
            <div>
              <h5>{option.name}</h5>
              <div style={{ padding: '0px 10px' }}>
                <p>{option.address}</p>
                <p>
                  {option.zip_code.zip_code}, {option.zip_code.city_name}
                </p>
              </div>
              <div style={{ padding: '0px 10px', color: 'gray' }}>
                <p>Telefon: {option.phone ? option.phone.join(' ') : ''}</p>
                <p>
                  ID: {option._id} | Brugernavn: {option.username}
                </p>
                {isCreatingOrder && (
                  <>
                    {option.payment_method === PAYMENT_METHOD.PBS.value && option.credit_limit && option.credit_limit <= WARNING_CREDIT_LIMIT && (
                      <p style={{ color: 'red' }}>Resterende kredit: {option.credit_limit}</p>
                    )}
                    {option.payment_method === PAYMENT_METHOD.Card.value && (!option.card || option.card.length === 0) && (
                      <p style={{ color: 'red' }}>{MSG_DO_NOT_HAVE_SAVED_CARD}</p>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        }}
        renderInput={params => {
          return (
            <TextField
              {...params}
              autoFocus={autoFocus}
              label={label}
              placeholder={PLACEHOLDER_CUSTOMER}
              variant="standard"
              onBlur={e => {
                setFocus(false);
              }}
              onFocus={e => {
                setFocus(true);
              }}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <InputAdornment position="end">
                    {loading ? (
                      <CircularProgress size={15} />
                    ) : !value && keyword.current && options.length === 0 ? (
                      <div style={{ color: 'red' }}>ikke fundet</div>
                    ) : (
                      !disableClearable && (
                        <IconButton onClick={e => handleClear(params)}>
                          <Icon fontSize="small">clear</Icon>
                        </IconButton>
                      )
                    )}
                  </InputAdornment>
                ),
                style: { padding: 0 },
              }}
              onChange={event => {
                keyword.current = event.target.value;
                if (keyword.current && keyword.current.trim().length >= 2) {
                  let params = {
                    name: keyword.current,
                    type: customerType,
                    active: true,
                  };

                  makeRequest(params);
                } else {
                  setLoading(false);
                }
              }}
              onKeyUp={e => {
                if (e.which === 27 || (e.which === 13 && e.target.value == '')) {
                  //Esc
                  handleClear(params);
                }
              }}
            />
          );
        }}
        getOptionSelected={(option, value) => option._id == value._id}
        onChange={(_, value, action) => {
          if (action === 'select-option' && value) {
            onChange(value);
            setOptions([]);
          }
        }}
      />
    </>
  );
};

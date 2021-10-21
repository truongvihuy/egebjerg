import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'app/axios';
import { bindActionCreators } from '@reduxjs/toolkit';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { showSuccessMessage, showErrorMessage } from 'app/store/fuse/messageSlice';

import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
// prettier-ignore
import {
  DialogContent, DialogTitle, IconButton, Icon, TextField,
  MenuItem, Checkbox, Switch, Popper, TextareaAutosize, FormControlLabel, InputAdornment
} from '@material-ui/core';
import { Grid, GridNoRecords, GridColumn as Column } from '@progress/kendo-react-grid';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { openDialog, closeDialog } from 'app/store/fuse/dialogSlice';
import LoadingPanel from 'app/kendo/LoadingPanel';
// prettier-ignore
import { getPagePermission, MSG_REQUIRED, MSG_NO_DATA, PAYMENT_METHOD, MSG_DO_NOT_HAVE_SAVED_CARD, CUSTOMER_TYPE_MAP } from 'app/constants';
import CommandInForm from 'app/kendo/CommandInForm';
import { FieldItem, processValue, InputLabel } from 'app/shared-components/FormController';
import { convertUnixTime, handleGoBack } from 'app/helper/general.helper';
import NumberTextField from 'app/shared-components/NumberTextField';
import { useSelector } from 'react-redux';

const customerTypeList = [
  {
    _id: 1,
    name: 'Visitation',
  },
  {
    _id: 2,
    name: 'MiniAdmin',
  },
];
const customerSchema = {
  name: null,
  username: null,
  email: null,
  store_id: null,
  store_customer_number: null,
  favorite_list: null,
  most_bought_list: null,
  membership_number: null,
  billing: null,
  replacement_goods: null,
  pay_by_pbs: null,
  address: null,
  zip_code_id: null,
  phone: null,
  session: null,
  type: null,
  active: null,
  admin_comment: null,
  pbs_customer_number: null,
  credit_limit: null,
  delivery_fee: null,
  comment_list: null,
  payment_method: null,
  zip_code: {
    municipality_id: null,
  },
};
const schema = yup.object().shape({
  name: yup.string().required(MSG_REQUIRED),
  active: yup.boolean().required(MSG_REQUIRED),
  store_id: yup.mixed().when('type', {
    is: CUSTOMER_TYPE_MAP.normal,
    then: yup.number().required(MSG_REQUIRED),
  }),
  zip_code: yup.mixed().when('type', {
    is: CUSTOMER_TYPE_MAP.normal,
    then: yup.object().required(MSG_REQUIRED),
  }),
  address: yup.mixed().when('type', {
    is: CUSTOMER_TYPE_MAP.normal,
    then: yup.string().required(MSG_REQUIRED),
  }),
  phone: yup.mixed().when('type', {
    is: CUSTOMER_TYPE_MAP.normal,
    then: yup.array().min(1).required(MSG_REQUIRED),
  }),
  store_customer_number: yup
    .number()
    .nullable()
    .transform((v, o) => (o === '' ? null : v))
    .test('len', 'Skal bestå af nøjagtigt 13 tegn', val => !val || (val && val.toString().length === 13)),
  type: yup.number().required(MSG_REQUIRED),
});

const EditForm = props => {
  const storeList = useSelector(({ fuse }) => fuse.cache.storeList);
  const { control, formState, handleSubmit, reset, getValues, setValue, watch } = useForm({
    mode: 'onSubmit',
    defaultValues: props.item ? { ...customerSchema, ...props.item } : null,
    resolver: yupResolver(schema),
  });
  const item = watch();
  const { errors } = formState;
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      let errorMessage = '';
      // props.showErrorMessage(errorMessage)
    }
  }, [errors]);

  useEffect(() => {
    (async () => {
      if (item === null) {
        if (!props.pagePermission.update) {
          handleGoBack(props.history, 'customer');
        }

        await axios
          .get(`/customers/${props.editId}`, {})
          .then(response => {
            let itemResponse = {
              ...customerSchema,
              ...response.data.data,
            };
            //itemResponse.customer_list default is object, not array
            let customerList = [];
            for (const key in itemResponse.customer_list) {
              customerList.push(itemResponse.customer_list[key]);
            }
            itemResponse.customer_list = customerList;
            reset(itemResponse);
          })
          .catch(error => {
            handleGoBack(props.history, 'customer');
            console.error('fail');
          });
      } else {
        reset(item);
      }
    })();
  }, []);

  const ZipCodeInfoComponent = propsCell => {
    const propsValue = propsCell.value ?? {
      _id: null,
      zip_code: null,
      city_id: null,
      city_name: '',
      municipality_id: null,
      municipality_name: '',
    };

    const handleOnChange = e => {
      propsCell.onChange({
        ...propsValue,
        [e.target.name]: e.target.value,
      });
    };

    const [zipCodeList, setZipCodeList] = useState([]);
    let idTimeOut = useRef(null);
    const onFilterChange = e => {
      if (!!e) {
        let value = e?.target?.value ?? null;
        if (e._reactName == 'onBlur' || value === null) {
          return;
        }
        if (idTimeOut) {
          clearTimeout(idTimeOut);
        }
        idTimeOut = setTimeout(
          () =>
            axios
              .get(`/zip-codes`, {
                params: {
                  zip_code: value,
                },
              })
              .then(response => {
                if (!response.data.data.zip_code_list.map(x => x._id).includes(propsValue._id)) {
                  response.data.data.zip_code_list.unshift(propsValue);
                }
                setZipCodeList(response.data.data.zip_code_list);
              })
              .catch(error => {
                props.showErrorMessage();
              }),
          500,
        );
      }
    };
    return (
      <>
        <Autocomplete
          value={propsValue._id ? propsValue : null}
          getOptionSelected={(e, v) => {
            return e._id == v._id;
          }}
          options={zipCodeList}
          renderInput={params => {
            return (
              <div ref={params.InputProps.ref}>
                <FieldItem label="Postnr. *">
                  <NumberTextField
                    {...params}
                    value={processValue(params.value)}
                    style={{ width: '200px' }}
                    id="zip_code"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <div>
                          {params.InputProps.endAdornment}
                          <InputAdornment position="end">
                            <Icon>search</Icon>
                          </InputAdornment>
                        </div>
                      ),
                    }}
                    error={!!errors.zip_code}
                    helperText={errors?.zip_code?.message}
                  />
                </FieldItem>
              </div>
            );
          }}
          getOptionLabel={option => {
            return option.zip_code ? option.zip_code.toString() : '';
          }}
          PopperComponent={props => <Popper {...props} style={{ marginLeft: '-20px', width: '200px' }} />}
          renderOption={option => {
            return (
              <div>
                <span>{`${option.zip_code} ${option.city_name}`}</span>
                <p style={{ fontWeight: 200, fontSize: 10 }}>{option.municipality_name}</p>
              </div>
            );
          }}
          onInputChange={e => onFilterChange(e)}
          onBlur={() => setZipCodeList([])}
          onChange={(e, newValue) => {
            if (newValue) {
              setZipCodeList([]);
              propsCell.onChange({
                ...propsValue,
                city_name: newValue?.city_name ?? '',
                municipality_name: newValue?.municipality_name ?? '',
                municipality_id: newValue?.municipality_id ?? '',
                zip_code: newValue?.zip_code?.toString() ?? '',
                _id: newValue._id,
              });
            }
          }}
          open={zipCodeList.length > 0}
        />
        <FieldItem label="By">
          <TextField name="city" fullWidth disabled={true} value={processValue(propsValue.city_name)} />
        </FieldItem>
        <FieldItem label="Kommune">
          <TextField id="municipality" name="municipality" fullWidth disabled={true} value={processValue(propsValue.municipality_name)} />
        </FieldItem>
      </>
    );
  };
  const BillingComponent = useCallback(
    propsCell => {
      if (item.payment_method != 'PBS') {
        return null;
      }
      const [propsValue, setPropsValue] = useState(
        propsCell.value
          ? {
              ...propsCell.value,
              zip_code: propsCell.value.zip_code?.zip_code ?? propsCell.value.zip_code ?? null,
              city_name: propsCell.value.zip_code?.city_name ?? propsCell.value.city_name ?? null,
            }
          : {
              name: '',
              address: null,
              zip_code_id: null,
              zip_code: null,
              city_name: null,
            },
      );
      useEffect(() => {
        setPropsValue(
          propsCell.value
            ? {
                ...propsCell.value,
                zip_code: propsCell.value.zip_code?.zip_code ?? propsCell.value.zip_code ?? null,
                city_name: propsCell.value.zip_code?.city_name ?? propsCell.value.city_name ?? null,
              }
            : {
                name: '',
                address: null,
                zip_code_id: null,
                zip_code: null,
                city_name: null,
              },
        );
      }, [propsCell.value]);
      useEffect(() => {
        return () => {
          clearTimeout(idTimeOut);
        };
      }, []);
      const [zipCodeList, setZipCodeList] = useState([]);

      let idTimeOut = useRef(null);
      const onFilterChange = e => {
        if (!!e) {
          let value = e?.target?.value ?? null;
          if (e._reactName == 'onBlur' || value === null) {
            return;
          }
          if (idTimeOut) {
            clearTimeout(idTimeOut);
          }
          idTimeOut = setTimeout(
            () =>
              axios
                .get(`/zip-codes`, {
                  params: {
                    zip_code: value,
                  },
                })
                .then(response => {
                  setZipCodeList(response.data.data.zip_code_list);
                })
                .catch(error => {
                  props.showErrorMessage();
                }),
            500,
          );
        }
      };
      return (
        <>
          <p className="mt-20">Tilføj pårørende som betalingsmodtager</p>
          <FieldItem label="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Navn">
            <TextField
              value={processValue(propsValue.name)}
              name="name"
              onChange={e => {
                propsCell.onChange({ ...propsValue, name: e.target.value });
              }}
            />
          </FieldItem>
          <FieldItem label="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Adresse">
            <TextField
              value={processValue(propsValue.address)}
              name="address"
              onChange={e => {
                propsCell.onChange({ ...propsValue, address: e.target.value });
              }}
            />
          </FieldItem>
          <Autocomplete
            open={zipCodeList.length > 0}
            value={propsValue}
            options={zipCodeList}
            renderInput={params => {
              return (
                <div ref={params.InputProps.ref}>
                  <FieldItem label="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Postnr.">
                    <NumberTextField
                      style={{ width: '200px' }}
                      {...params}
                      value={processValue(params.value)}
                      fullWidth={false}
                      id="zip_code"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <div>
                            {params.InputProps.endAdornment}
                            <InputAdornment position="end">
                              <Icon>search</Icon>
                            </InputAdornment>
                          </div>
                        ),
                      }}
                    />
                  </FieldItem>
                </div>
              );
            }}
            getOptionLabel={option => {
              return option.zip_code ? option.zip_code.toString() : '';
            }}
            PopperComponent={props => <Popper {...props} style={{ marginLeft: '-20px', width: '200px' }} />}
            renderOption={option => {
              return (
                <div>
                  <span>{`${option.zip_code} ${option.city_name}`}</span>
                  <p style={{ fontWeight: 200, fontSize: 10 }}>{option.municipality_name}</p>
                </div>
              );
            }}
            onInputChange={e => onFilterChange(e)}
            onBlur={() => setZipCodeList([])}
            onChange={(e, newValue) => {
              if (newValue) {
                setZipCodeList([]);
                propsCell.onChange({
                  ...propsValue,
                  city_name: newValue?.city_name ?? '',
                  zip_code: newValue?.zip_code?.toString() ?? '',
                  zip_code_id: newValue._id,
                });
              }
            }}
          />
          <FieldItem label="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;By">
            <TextField disabled={true} value={processValue(propsValue.city_name)} name="city" />
          </FieldItem>
        </>
      );
    },
    [item?.payment_method],
  );
  const CardComponent = propsController => {
    const handleOnChange = e => {
      let newValue = propsController.value.map(x => {
        if (x._id == e._id) {
          return {
            ...x,
            type: 'primary',
          };
        } else {
          return {
            ...x,
            type: 'secondary',
          };
        }
      });
      propsController.onChange(newValue);
    };
    const handleAddPayment = e => {
      props.openDialog({
        children: <StripeForm />,
      });
    };
    if (propsController.value) {
      const responsive = {
        desktop: {
          breakpoint: { max: 3000, min: 1024 },
          items: 2,
        },
      };
      return (
        <>
          <div className="flex justify-between">
            <h3>Kort</h3>
            <IconButton onClick={handleAddPayment}>
              <Icon>add</Icon>
            </IconButton>
          </div>
          <Carousel
            // slidesToSlide={1}
            deviceType={'desktop'}
            responsive={responsive}
            // infinite={true}
            // arrows={true}
          >
            {propsController.value.map(card => {
              return <Card key={card._id} {...card} onClick={handleOnChange} />;
            })}
          </Carousel>
        </>
      );
    } else {
      return null;
    }
  };
  const StoreComponent = useCallback(
    propsCell => {
      const store = storeList.find(x => x._id == propsCell.value);
      const [storeListTmp, setStoreListTmp] = useState([]);
      useEffect(() => {
        if (item.zip_code.municipality_id) {
          let newStoreList = storeList.filter(x => x.municipality_list.includes(item.zip_code.municipality_id));
          setStoreListTmp(newStoreList);

          if (store && newStoreList.map(x => x._id).indexOf(store._id) == -1) {
            propsCell.onChange(null);
            setValue('payment_method', null);
          }
        } else {
          setStoreListTmp(storeList);
        }
      }, [item.zip_code.municipality_id]);
      return (
        <>
          <Autocomplete
            PopperComponent={props => <Popper {...props} style={{ marginLeft: '50px', width: '200px' }} />}
            value={props.value == '' ? null : store}
            options={storeListTmp}
            renderInput={params => {
              return (
                <div ref={params.InputProps.ref}>
                  <FieldItem label="Butik *">
                    <TextField
                      {...params.inputProps}
                      style={{ width: 200 }}
                      type="text"
                      value={processValue(params.inputProps.value)}
                      error={!!errors.store_id}
                      helperText={errors?.store_id?.message}
                    />
                  </FieldItem>
                </div>
              );
            }}
            getOptionLabel={option => {
              return option.name.toString();
            }}
            getOptionSelected={(e, v) => {
              if (v) {
                return e._id == v._id;
              }
              return false;
            }}
            renderOption={option => {
              return (
                <div>
                  <span>{option.name}</span>
                </div>
              );
            }}
            onChange={(e, newValue) => {
              if (newValue) {
                let item = getValues();
                if (!newValue.payment.includes(item.payment_method)) {
                  reset({
                    ...item,
                    payment_method: newValue.payment[0],
                  });
                }
                propsCell.onChange(newValue._id);
              }
            }}
          />
          <Controller
            name="payment_method"
            control={control}
            render={({ field }) => {
              return (
                <>
                  <FieldItem label="Betalingsmetode *">
                    <TextField
                      {...field}
                      style={{ width: '300px' }}
                      value={store && store.payment.includes(field.value) ? processValue(field.value) : ''}
                      onChange={e => {
                        field.onChange(e.target.value);
                      }}
                      id="payment_method"
                      select
                      error={!!errors.payment_method}
                      helperText={errors?.payment_method?.message}>
                      {store &&
                        store.payment.map(option => (
                          <MenuItem key={option} value={option}>
                            {PAYMENT_METHOD[option]?.label ?? option}
                          </MenuItem>
                        ))}
                    </TextField>
                  </FieldItem>
                  {field.value == 'Card' ? (
                    <FieldItem label="Kort">
                      {item.card?.length > 0 ? (
                        <span>
                          {item.card[0].cardType[0].toUpperCase() + item.card[0].cardType.slice(1)}{' '}
                          {`${item.card[0].bin}******${item.card[0].lastFourDigit}`.match(/.{1,4}/g).join(' ')}
                        </span>
                      ) : (
                        <span style={{ color: 'orange' }}>{MSG_DO_NOT_HAVE_SAVED_CARD}</span>
                      )}
                    </FieldItem>
                  ) : null}
                </>
              );
            }}
          />
          <Controller
            name="pbs_customer_number"
            control={control}
            render={({ field }) => (
              <FieldItem label="PBS kundenummer">
                <TextField
                  {...field}
                  type="number"
                  value={processValue(field.value)}
                  disabled={true}
                  id="pbs_customer_number"
                  error={!!errors.pbs_customer_number}
                  helperText={errors?.pbs_customer_number?.message}
                />
              </FieldItem>
            )}
          />
        </>
      );
    },
    [item?.zip_code, storeList, errors],
  );

  const AddCommentComponent = propsCell => {
    const [valueInput, setValueInput] = useState();
    const handleAdd = () => {
      if (valueInput && valueInput.length > 0) {
        let now = Math.round(+new Date() / 1000);
        let newComment = [convertUnixTime(now, 'dd-MM-yyyy'), valueInput];
        propsCell.onChange([newComment, ...(propsCell.value ?? [])]);
      }
    };
    return (
      <>
        <div className="flex">
          <TextareaAutosize
            style={{ marginTop: '20px', width: '480px' }}
            minRows={2}
            maxRows={3}
            label="Tilføj en ny kommentar"
            placeholder="Indtast kommentar og tryk derefter på + ikonet"
            onChange={e => {
              setValueInput(e.target.value);
            }}
          />
          <IconButton style={{ width: 40, height: 40, top: 20 }} id="add-button" type="button" onClick={handleAdd} color="primary">
            <Icon>add</Icon>
          </IconButton>
        </div>
      </>
    );
  };

  const onSubmit = (data, e) => {
    if (data.type == CUSTOMER_TYPE_MAP.normal) {
      data.zip_code_id = data.zip_code._id;
      data.billing = data.billing
        ? {
            address: data.billing.address,
            name: data.billing.name,
            zip_code_id: data.billing.zip_code_id,
          }
        : null;
    }
    let keySchema = Object.keys(customerSchema);

    for (const key in data) {
      if (!keySchema.includes(key)) {
        delete data[key];
      }
    }

    if (props.onSubmit) {
      props.onSubmit(data);
    } else {
      //edit;
      delete data.customer_list;
      delete data.manage_by;
      delete data.username;
      delete data.password;

      axios.put(`/customers/${props.editId}`, data).then(response => {
        props.showSuccessMessage();
        handleGoBack(props.history, 'customer');
        props.setCustomerList(
          props.customerList.map(customer => {
            if (customer._id == response.data.data._id) {
              return {
                ...customer,
                ...response.data.data,
              };
            }
            return customer;
          }),
        );
      });
    }
  };
  const remove = dataItem => {
    if (!props.pagePermission.delete) {
      return;
    }

    axios
      .delete(`/customers/${dataItem._id}`)
      .then(response => {
        props.showSuccessMessage();
        handleGoBack(props.history, 'customer');
        props.setCustomerList(
          props.customerList.filter(customer => {
            return customer._id != dataItem._id;
          }),
        );
        props.closeDialog();
      })
      .catch(error => {
        props.showErrorMessage();
        props.closeDialog();
      });
  };
  const ReplacementGoodsComponent = props => {
    const handleOnChange = e => {
      if (e.target.name == 'ordinary' && props.value?.ordinary == false) {
        props.onChange({
          ...props.value,
          ordinary: true,
          milk_and_bread: true,
        });
      } else {
        props.onChange({
          ...props.value,
          [e.target.name]: props.value ? !props.value[e.target.name] : true,
        });
      }
    };
    return (
      <>
        <h4 className="mt-20">Ønsker du erstatningsvarer</h4>
        <div className="flex justify-around mt-10">
          <span>
            <p>alm. varer</p>
            <Switch color="primary" name="ordinary" onChange={handleOnChange} checked={props.value ? props.value.ordinary : false} />
          </span>
          {props.value?.ordinary ? null : (
            <span>
              <p>mælk og brød</p>
              <Switch color="primary" name="milk_and_bread" onChange={handleOnChange} checked={props.value?.milk_and_bread ?? false} />
            </span>
          )}

          <span>
            <p>tilbudsvarer</p>
            <Switch color="primary" name="promotion" onChange={handleOnChange} checked={props.value?.promotion ?? false} />
          </span>
        </div>
      </>
    );
  };
  if (item && storeList) {
    return (
      <>
        <form
          onSubmit={handleSubmit(onSubmit)}
          autoComplete="off"
          style={{
            margin: '0 auto',
            width: '1200px',
          }}
          onKeyDown={e => {
            let key = e.charCode || e.keyCode || 0;
            if (key == 13) {
              e.preventDefault();
            }
          }}>
          <DialogTitle id="alert-dialog-title" style={{ textAlign: 'center' }}>
            {props.editId && (
              <IconButton style={{ float: 'left', height: '30px' }} title="Back" onClick={() => handleGoBack(props.history, 'customer')}>
                <Icon>arrow_back</Icon>
              </IconButton>
            )}
            <div>{item._id ? `Opdater kunde ${item.name}` : 'Opret kunde'}</div>
          </DialogTitle>
          <DialogContent style={{ height: 'calc(100vh - 275px)' }}>
            <div className="flex justify-around">
              <div className="w-5/12 h-full">
                <div className="flex justify-evenly">
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <FieldItem label="Kundetype *" gridCols="grid-cols-12" labelCols="col-span-5" marginTop="">
                        <TextField
                          {...field}
                          value={field.value ?? 1}
                          onChange={e => {
                            field.onChange(e.target.value);
                          }}
                          id="type"
                          select
                          error={!!errors.type}
                          helperText={errors?.type?.message}>
                          {customerTypeList.map(option => (
                            <MenuItem key={option._id} value={option._id}>
                              {option.name}
                            </MenuItem>
                          ))}
                        </TextField>
                      </FieldItem>
                    )}
                  />

                  <Controller
                    name="active"
                    control={control}
                    render={({ field }) => {
                      return (
                        <FormControlLabel
                          style={{ flexBasis: '25%' }}
                          control={<Checkbox color="primary" onChange={field.onChange} checked={field.value ?? item.active} />}
                          label="Aktiv"
                        />
                      );
                    }}
                  />
                </div>

                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <FieldItem label="Navn *">
                      <TextField {...field} value={processValue(field.value)} fullWidth error={!!errors.name} helperText={errors?.name?.message} />
                    </FieldItem>
                  )}
                />

                <Controller
                  name="username"
                  control={control}
                  render={({ field }) => (
                    <FieldItem label="Brugernavn">
                      <TextField
                        {...field}
                        value={processValue(field.value)}
                        fullWidth
                        id="username"
                        error={!!errors.username}
                        helperText={errors?.username?.message}
                      />
                    </FieldItem>
                  )}
                />

                {item.type === CUSTOMER_TYPE_MAP.normal ? (
                  <>
                    <Controller
                      name="address"
                      control={control}
                      render={({ field }) => (
                        <FieldItem label="Adresse *">
                          <TextField
                            {...field}
                            value={processValue(field.value)}
                            fullWidth
                            type="address"
                            error={!!errors.address}
                            helperText={errors?.address?.message}
                          />
                        </FieldItem>
                      )}
                    />
                    <Controller
                      name="zip_code"
                      control={control}
                      render={({ field }) => (
                        <ZipCodeInfoComponent
                          onChange={field.onChange}
                          value={field.value}
                          type="zip_code"
                          className="mt-10"
                          id="zip_code"
                          label="Adresseinfo"
                        />
                      )}
                    />
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <FieldItem label="Email">
                          <TextField
                            {...field}
                            value={processValue(field.value)}
                            fullWidth
                            id="email"
                            error={!!errors.email}
                            helperText={errors?.email?.message}
                          />
                        </FieldItem>
                      )}
                    />
                    <Controller
                      name="phone"
                      control={control}
                      render={({ field }) => (
                        <FieldItem label="Telefon *">
                          <TextField
                            {...field}
                            value={processValue(field.value[0])}
                            onChange={e => {
                              if (e.target.value == '') {
                                if (field.value[1]) {
                                  field.onChange([field.value[1]]);
                                } else {
                                  field.onChange([]);
                                }
                              } else {
                                let newValue = [...field.value];
                                newValue[0] = e.target.value;
                                field.onChange(newValue);
                              }
                            }}
                            className="w-1/3 mr-10"
                            id="phone-1"
                            error={!!errors.phone}
                            helperText={errors?.phone?.message}
                          />
                          <TextField
                            {...field}
                            value={processValue(field.value[1])}
                            onChange={e => {
                              if (e.target.value == '') {
                                if (field.value[0]) {
                                  field.onChange([field.value[0]]);
                                } else {
                                  field.onChange([]);
                                }
                              } else {
                                let newValue = [...field.value];
                                newValue[1] = e.target.value;
                                field.onChange(newValue);
                              }
                            }}
                            className="w-1/3"
                            id="phone-2"
                            error={!!errors.phone}
                            helperText={errors?.phone?.message}
                          />
                        </FieldItem>
                      )}
                    />
                    <Controller
                      name="membership_number"
                      control={control}
                      render={({ field }) => (
                        <FieldItem label="Medlemskort">
                          <NumberTextField
                            {...field}
                            value={processValue(field.value)}
                            fullWidth
                            id="membership_number"
                            error={!!errors.membership_number}
                            helperText={errors?.membership_number?.message}
                          />
                        </FieldItem>
                      )}
                    />

                    <Controller
                      name="replacement_goods"
                      control={control}
                      render={({ field }) => <ReplacementGoodsComponent value={field.value} onChange={field.onChange} />}
                    />
                
                    <Controller
                      name="admin_comment"
                      control={control}
                      render={({ field }) => (
                        <div className="mt-10">
                          <InputLabel label="Administrator kommentar" />
                          <TextareaAutosize
                            {...field}
                            minRows={3}
                            style={{
                              width: '100%',
                              marginTop: '10px',
                              border: '1px solid #EEEEEE',
                              padding: '5px',
                            }}
                            id="admin_comment"
                            placeholder="Indtast værdi her"
                            value={field.value || ''}
                          />
                        </div>
                      )}
                    />
                  </>
                ) : null}
              </div>
              {item.type === CUSTOMER_TYPE_MAP.normal && (
                <div className="w-5/12 h-full">
                  <Controller
                    name="store_id"
                    control={control}
                    render={({ field }) => {
                      return <StoreComponent onChange={field.onChange} value={field.value} type="store" id="store" storeList={storeList} />;
                    }}
                  />
                  <Controller
                    name="store_customer_number"
                    control={control}
                    render={({ field }) => {
                      return (
                        <FieldItem label="Butik kundenummer">
                          <NumberTextField
                            {...field}
                            value={processValue(field.value)}
                            fullWidth
                            id="store_customer_number"
                            error={!!errors.store_customer_number}
                            helperText={errors?.store_customer_number?.message}
                          />
                        </FieldItem>
                      );
                    }}
                  />
                  <Controller
                    name="billing"
                    control={control}
                    render={({ field }) => (
                      <BillingComponent onChange={field.onChange} value={field.value} type="billing" className="mt-10" id="billing" label="Billing" />
                    )}
                  />
                  <Controller
                    name="credit_limit"
                    control={control}
                    render={({ field }) => (
                      <FieldItem label="Kredit grænse">
                        <NumberTextField
                          {...field}
                          value={processValue(field.value)}
                          style={{
                            width: '200px',
                          }}
                          fullWidth={false}
                          id="credit_limit"
                          InputProps={{
                            startAdornment: <InputAdornment position="start">DKK</InputAdornment>,
                          }}
                          error={!!errors.credit_limit}
                          helperText={errors?.credit_limit?.message}
                        />
                      </FieldItem>
                    )}
                  />
                  <Controller
                    name="delivery_fee"
                    control={control}
                    render={({ field }) => (
                      <FieldItem label="Leveringsgebyr">
                        <NumberTextField
                          {...field}
                          value={processValue(field.value)}
                          style={{
                            width: '200px',
                          }}
                          fullWidth={false}
                          id="delivery_fee"
                          InputProps={{
                            startAdornment: <InputAdornment position="start">DKK</InputAdornment>,
                          }}
                          error={!!errors.delivery_fee}
                          helperText={errors?.delivery_fee?.message}
                        />
                      </FieldItem>
                    )}
                  />

                  <Controller
                    name="comment_list"
                    control={control}
                    render={({ field }) => {
                      let fieldValue = [];
                      if (field.value) {
                        fieldValue = field.value.map((x, index) => {
                          return {
                            id: index,
                            date: x[0],
                            content: x[1],
                          };
                        });
                      }
                      return (
                        <>
                          <AddCommentComponent value={field.value} onChange={field.onChange} />
                          <Grid data={fieldValue} sortable={false} style={{ height: 160, marginTop: 10 }}>
                            <GridNoRecords>{MSG_NO_DATA}</GridNoRecords>
                            <Column field="date" title="Dato" width="120" />
                            <Column field="content" title="Kommentar" />
                            <Column
                              width="50"
                              cell={({ dataItem }) => {
                                return (
                                  <IconButton
                                    color="secondary"
                                    onClick={() => {
                                      let newValue = field.value.filter(x => {
                                        return !(x[0] == dataItem.date && x[1] == dataItem.content);
                                      });
                                      field.onChange(newValue);
                                    }}>
                                    <Icon fontSize="small">delete</Icon>
                                  </IconButton>
                                );
                              }}
                            />
                          </Grid>
                        </>
                      );
                    }}
                  />
                </div>
              )}
            </div>
          </DialogContent>
          <CommandInForm
            pagePermission={props.pagePermission}
            remove={remove}
            dataItem={item}
            openDialog={props.openDialog}
            closeDialog={() => {
              if (props.editId) {
                handleGoBack(props.history, 'customer');
                props.closeDialog();
              } else {
                props.closeDialog();
              }
            }}
          />
        </form>
      </>
    );
  } else {
    return <LoadingPanel />;
  }
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      showSuccessMessage,
      showErrorMessage,
      openDialog,
      closeDialog,
    },
    dispatch,
  );
}

function mapStateToProps({ auth }) {
  return {
    pagePermission: getPagePermission('customer', auth.user),
    user: auth.user,
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(EditForm));

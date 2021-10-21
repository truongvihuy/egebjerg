import { useState, useEffect, cloneElement, useRef } from 'react';
import {
  FormControlLabel,
  DialogContent,
  DialogTitle,
  TextField,
  Checkbox,
  AppBar,
  Tabs,
  Tab,
  Switch,
  IconButton,
  Icon,
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import axios from 'app/axios';

import { showMessage, showSuccessMessage, showErrorMessage } from 'app/store/fuse/messageSlice';
import { connect } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';
import history from '@history';

import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { MSG_REQUIRED, MSG_NO_DATA } from 'app/constants';
import CommandInForm from 'app/kendo/CommandInForm';
import { getPagePermission } from 'app/constants';
import LoadingPanel from 'app/kendo/LoadingPanel';
import { Grid, GridNoRecords, GridColumn as Column } from '@progress/kendo-react-grid';
const fieldTabList = [
  [
    'name',
    'email',
    'bakery_email',
    'address',
    'zip_code_id',
    'municipality_list',
    'kardex_number',
    'send_packing_slip',
    'has_its_own_prices',
    'payment',
  ],
  ['checkout_info'],
];
const schema = yup.object().shape({
  name: yup.string().required(MSG_REQUIRED),
  bakery_email: yup.string().nullable(),
  address: yup.string().required(MSG_REQUIRED),
  zip_code_info: yup.object().required(MSG_REQUIRED),
  send_packing_slip: yup.boolean().required(MSG_REQUIRED),
  municipality_list: yup.array().required(MSG_REQUIRED),
  kardex_number: yup.string().required(MSG_REQUIRED),
  has_its_own_prices: yup.boolean().required(MSG_REQUIRED),
  has_quickpay: yup.boolean().required(MSG_REQUIRED),
  has_quickpay_capture_activated: yup.boolean().required(MSG_REQUIRED),
  quickpay_info: yup.object().required(MSG_REQUIRED),
  checkout_info: yup.object().nullable(),
  payment: yup.array().required(MSG_REQUIRED),
});
const processValue = (value, type = 'text') => {
  return value ?? (type == 'text' ? 'null' : 0);
};
const StoreForm = props => {
  const [itemModel, setItemModel] = useState(null);
  const [indexTab, setIndexTab] = useState(0);
  const [municipalityList, setMunicipalityList] = useState(props.municipalityList ?? null);

  const { control, formState, handleSubmit, reset } = useForm({
    mode: 'onSubmit',
    defaultValues: itemModel,
    resolver: yupResolver(schema),
  });

  const { errors } = formState;
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      let errorMessage = '';
      let errorTab = indexTab;
      for (const property in errors) {
        if (fieldTabList[0].includes(property)) {
          errorTab = 0;
          break;
        } else if (fieldTabList[1].includes(property)) {
          errorTab = 1;
          break;
        } else {
          errorTab = 3;
          break;
        }
      }
      if (errorTab != indexTab) {
        setIndexTab(errorTab);
      }
      // props.showErrorMessage(errorMessage)
    }
  }, [errors]);

  const cancelUpdate = () => {
    history.push({
      pathname: `/store`,
    });
  };

  useEffect(async () => {
    let municipalityListTmp = [];
    if (municipalityList === null) {
      await axios
        .get(`/municipalities`, { params: { field: '_id,name' } })
        .then(response => {
          setMunicipalityList(response.data.data);
          municipalityListTmp = response.data.data;
        })
        .catch(error => {
          setMunicipalityList([]);
        });
    }

    if (!props.dataItem) {
    } else {
      let itemProp = { ...props.dataItem };
      if (itemProp.municipality_list.length > 0) {
        itemProp.municipality_list = itemProp.municipality_list.map(x => municipalityListTmp.find(y => x == y._id));
      }
      reset(itemProp);
      setItemModel(itemProp);
    }
  }, [props.dataItem]);

  const ComboBoxMunicipalityList = props => {
    const [data, setData] = useState(municipalityList);

    return (
      <div className="mt-10">
        <Autocomplete
          disableClearable={true}
          style={{ width: '100%' }}
          id="municipality_list"
          value={props.value}
          options={data}
          getOptionLabel={option => {
            if (!!option.length) {
              return ''
            }
            return option.name;
          }}
          renderInput={params => <TextField {...params} label="Kommuneliste *" />}
          renderTags={value => null}
          onChange={(e, newMunicipality) => {
            if (newMunicipality) {
              let newValue = [];
              if (props.value.find(x => newMunicipality._id == x._id)) {
                newValue = props.value.filter(x => x._id != newMunicipality._id);
              } else {
                newValue = [...props.value, newMunicipality];
              }
              props.onChange(newValue);
            }
          }}
          getOptionSelected={(option) => typeof props.value.find(x => x._id == option._id) != 'undefined'}
        />
        <Grid data={props.value}>
          <GridNoRecords>{MSG_NO_DATA}</GridNoRecords>
          <Column field="_id" title="ID" width="100" />
          <Column field="name" title="Navn" />
          <Column
            width="50"
            cell={({ dataItem }) => {
              return (
                <td>
                  <IconButton
                    size="small"
                    color="secondary"
                    onClick={() => {
                      let newValue = props.value.filter(x => x._id != dataItem._id);
                      props.onChange(newValue);
                    }}>
                    <Icon fontSize="small">delete</Icon>
                  </IconButton>
                </td>
              );
            }}
          />
        </Grid>
      </div>
    );
  };

  const ComboBoxZipCode = props => {
    let propsValue = props.value ?? null;

    const [zipCodeList, setZipCodeList] = useState([]);
    let idTimeOut = useRef(null);
    const onFilterChange = value => {
      if (!!value) {
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
                props.showMessage({
                  message: error.message,
                  variant: 'error',
                });
              }),
          500,
        );
      }
    };

    return (
      <div className="mt-10 flex justify-start h-170">
        <Autocomplete
          style={{ width: 200 }}
          id="zip-code"
          value={propsValue}
          options={zipCodeList}
          getOptionLabel={option => {
            return option.zip_code.toString();
          }}
          renderOption={option => {
            return (
              <div>
                <span>{`${option.zip_code} ${option.city_name}`}</span>
                <p style={{ fontWeight: 200, fontSize: 10 }}>{option.municipality_name}</p>
              </div>
            );
          }}
          renderInput={params => <TextField {...params} label="Postnummer *" />}
          onInputChange={x => onFilterChange(x?.target?.value)}
          onChange={(e, newValue) => {
            props.onChange(newValue);
          }}
        />
        <TextField id="city_name" label="By" value={propsValue?.city_name ?? ''} style={{ width: 200, marginLeft: '15px' }} disabled />
      </div>
    );
  };

  const PaymentComponent = props => {
    const [hasPayment, setHasPayment] = useState(props.value ? props.value.length > 0 : false);
    let propsValue = props.value ?? [];

    const handleOnChange = (e, value) => {
      if (propsValue.includes(value)) {
        propsValue = propsValue.filter(x => {
          return x !== value;
        });
      } else {
        propsValue = [value, ...propsValue];
      }
      props.onChange(propsValue);
    };

    return (
      <>
        <div className="flex">
          <p style={{ margin: 'auto 0' }}>Betaling *</p>
          <Switch
            onChange={e => {
              if (hasPayment) {
                props.onChange([]);
              }
              setHasPayment(!hasPayment);
            }}
            checked={hasPayment}
          />
        </div>
        {hasPayment ? (
          <div className="flex justify-around">
            <div>
              <Switch onChange={e => handleOnChange(e, 'PBS')} checked={propsValue.includes('PBS')} />
              <span>PBS</span>
            </div>
            <div>
              <Switch onChange={e => handleOnChange(e, 'Card')} checked={propsValue.includes('Card')} />
              <span>Kort</span>
            </div>
          </div>
        ) : null}
      </>
    );
  };

  const CheckoutInfoComponent = props => {
    const propsValue = {
      phone: props.value?.phone ?? '',
      email: props.value?.email ?? '',
      cvr_number: props.value?.cvr_number ?? '',
    };

    const handleOnChange = e => {
      props.onChange({
        ...propsValue,
        [e.target.name]: e.target.value,
      });
    };

    return (
      <div className="grid mt-10">
        <TextField className="mt-10" label="Telefon" name="phone" value={propsValue.phone} onChange={handleOnChange} autoFocus={true} />
        <TextField className="mt-10" label="E-mail" name="email" value={propsValue.email} onChange={handleOnChange} />
        <TextField className="mt-10" label="CVR nummer" name="cvr_number" value={propsValue.cvr_number} onChange={handleOnChange} />
      </div>
    );
  };

  const QuickpayInfoComponent = props => {
    const propsValue = {
      secret: props.value?.secret ?? '',
      secret_key_account: props.value?.secret_key_account ?? '',
      api_key: props.value?.api_key ?? '',
      agreement_id: props.value?.agreement_id ?? '',
      merchant: props.value?.merchant ?? '',
      card_type: props.value?.card_type ?? '',
    };

    const handleOnChange = e => {
      props.onChange({
        ...propsValue,
        [e.target.name]: e.target.value,
      });
    };
    return (
      <div className="grid">
        <div className="mt-10 flex justify-start">
          <Controller className="mt-10" name="has_quickpay" control={control} render={({ field }) => CustomCheckBox(field, 'Har quickpay')} />
          <Controller
            className="mt-10"
            name="has_quickpay_capture_activated"
            control={control}
            render={({ field }) => CustomCheckBox(field, 'Har quickpay capture aktiveret')}
          />
        </div>
        <TextField className="mt-10" label="Hemmelighed" name="secret" value={propsValue.secret} onChange={handleOnChange} autoFocus={true} />
        <TextField className="mt-10" label="API-nøgle" name="api_key" value={propsValue.api_key} onChange={handleOnChange} />
        <TextField
          className="mt-10"
          label="Hemmelig nøglekonto"
          name="secret_key_account"
          value={propsValue.secret_key_account}
          onChange={handleOnChange}
        />
        <TextField className="mt-10" label="Aftale-id" name="agreement_id" value={propsValue.agreement_id} onChange={handleOnChange} />
        <TextField className="mt-10" label="Købmand" name="merchant" value={propsValue.merchant} onChange={handleOnChange} />
        <TextField className="mt-10" label="Korttyper" name="card_type" value={propsValue.card_type} onChange={handleOnChange} />
      </div>
    );
  };

  const onSubmit = data => {
    if (data.zip_code_info) {
      data.zip_code_id = data.zip_code_info._id;
    } else {
      props.showErrorMessage();
      return;
    }
    props.onSubmit(data);
  };

  const changeTab = index => {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  };

  const CustomCheckBox = (field, label) => {
    return <FormControlLabel control={<Checkbox checked={field.value ?? false} onChange={field.onChange} color="primary" />} label={label} />;
  };

  if (itemModel && municipalityList) {
    return (
      <div style={{ width: '550px', height: '95vh' }}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
          <DialogTitle id="dialog-title" className="text-center">
            {itemModel._id ? `Opdater butik ${itemModel.name}` : 'Opret butik'}
          </DialogTitle>

          <DialogContent>
            <AppBar position="static">
              <Tabs value={indexTab} aria-label="store-tabs">
                <Tab style={{ width: '33.333333%' }} value={0} label="Generel" {...changeTab(0)} onClick={() => setIndexTab(0)} />
                <Tab style={{ width: '33.333333%' }} value={1} label="Kasse" {...changeTab(1)} onClick={() => setIndexTab(1)} />
                <Tab style={{ width: '33.333333%' }} value={2} label="QuickPay" {...changeTab(2)} onClick={() => setIndexTab(2)} />
              </Tabs>
            </AppBar>
            <div className="mt-20">
              {indexTab == 0 ? (
                <div>
                  <Controller
                    className="mt-10"
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        className="mt-10"
                        id="name"
                        label="Navn *"
                        fullWidth
                        error={!!errors.name}
                        helperText={errors?.name?.message}
                      />
                    )}
                  />
                  <Controller
                    className="mt-10"
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        className="mt-10"
                        id="email"
                        label="E-mail"
                        fullWidth
                        error={!!errors.email}
                        helperText={errors?.email?.message}
                      />
                    )}
                  />
                  <Controller
                    className="mt-10"
                    name="bakery_email"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        className="mt-10"
                        id="bakery_email"
                        label="Bageri e-mail"
                        fullWidth
                        error={!!errors.bakery_email}
                        helperText={errors?.bakery_email?.message}
                      />
                    )}
                  />
                  <Controller
                    className="mt-10"
                    name="address"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        className="mt-10"
                        id="address"
                        label="Adresse *"
                        fullWidth
                        error={!!errors.address}
                        helperText={errors?.address?.message}
                      />
                    )}
                  />
                  <Controller
                    className="mt-10"
                    name="zip_code_info"
                    control={control}
                    render={({ field }) => (
                      <ComboBoxZipCode
                        value={field.value}
                        name={field.name}
                        onChange={field.onChange}
                        id="zip_code_info"
                        fullWidth
                        error={!!errors.zip_code_id}
                        helperText={errors?.zip_code_id?.message}
                      />
                    )}
                  />
                  <Controller
                    className="mt-10"
                    name="kardex_number"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        className="mt-10"
                        id="kardex_number"
                        label="Kardex nummer *"
                        fullWidth
                        error={!!errors.kardex_number}
                        helperText={errors?.kardex_number?.message}
                      />
                    )}
                  />
                  <div className="mt-10 flex justify-start">
                    <Controller
                      className="mt-10"
                      name="send_packing_slip"
                      control={control}
                      render={({ field }) => CustomCheckBox(field, 'Send pakkeseddel')}
                    />
                    <Controller
                      className="mt-10"
                      name="has_its_own_prices"
                      control={control}
                      render={({ field }) => CustomCheckBox(field, 'Har sine egne priser')}
                    />
                  </div>
                  <Controller
                    className="mt-10"
                    name="payment"
                    control={control}
                    render={({ field }) => (
                      <PaymentComponent
                        value={field.value}
                        name={field.name}
                        onChange={field.onChange}
                        id="payment"
                        fullWidth
                        error={!!errors.payment}
                        helperText={errors?.payment?.message}
                      />
                    )}
                  />
                  <Controller
                    name="municipality_list"
                    control={control}
                    render={({ field }) => (
                      <ComboBoxMunicipalityList
                        value={field.value}
                        name={field.name}
                        onChange={field.onChange}
                        id="municipality_list"
                        fullWidth
                        error={!!errors.municipality_list}
                        helperText={errors?.municipality_list?.message}
                      />
                    )}
                  />
                </div>
              ) : indexTab == 1 ? (
                <div>
                  <Controller
                    className="mt-10"
                    name="checkout_info"
                    control={control}
                    render={({ field }) => (
                      <CheckoutInfoComponent
                        value={field.value}
                        name={field.name}
                        onChange={field.onChange}
                        id="checkout_info"
                        fullWidth
                        error={!!errors.checkout_info}
                        helperText={errors?.checkout_info?.message}
                      />
                    )}
                  />
                </div>
              ) : (
                <Controller
                  className="mt-10"
                  name="quickpay_info"
                  control={control}
                  render={({ field }) => (
                    <QuickpayInfoComponent
                      value={field.value}
                      name={field.name}
                      onChange={field.onChange}
                      id="quickpay_info"
                      fullWidth
                      error={!!errors.quickpay_info}
                      helperText={errors?.quickpay_info?.message}
                    />
                  )}
                />
              )}
            </div>
          </DialogContent>
          <CommandInForm {...props} itemModel={itemModel} />
        </form>
      </div>
    );
  } else {
    return <LoadingPanel />;
  }
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      showMessage,
      showSuccessMessage,
      showErrorMessage,
    },
    dispatch,
  );
}

function mapStateToProps({ auth }) {
  return {
    pagePermission: getPagePermission('store', auth.user),
    municipalityPermission: getPagePermission('municipality', auth.user),
    user: auth.user,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(StoreForm);

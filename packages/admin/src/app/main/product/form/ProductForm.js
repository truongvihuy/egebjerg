import { useState, useRef, useCallback } from 'react';
// prettier-ignore
import {
  DialogContent, DialogTitle, TextField, Switch, InputAdornment,
  List, ListItem, ListItemIcon, Checkbox,
  ListItemText, FormControlLabel, Icon, IconButton, Button, Popper
} from '@material-ui/core';
import ClearIcon from '@material-ui/icons/Clear';
import CommandInForm from 'app/kendo/CommandInForm';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { MSG_REQUIRED, MSG_NO_DATA, CATEGORY_ID_BAKE, getPagePermission, TOOL_EDITOR, PRODUCT_STATUS } from 'app/constants';
import * as yup from 'yup';
import axios from 'app/axios';
import { connect } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';
import { showSuccessMessage, showErrorMessage } from 'app/store/fuse/messageSlice';
import Autocomplete from '@material-ui/lab/Autocomplete';
import LoadingPanel from 'app/kendo/LoadingPanel';
import ProductSearch from 'app/kendo/ProductSearch';
import { openDialog, closeDialog } from 'app/store/fuse/dialogSlice';
import { withRouter } from 'react-router-dom';
import { FieldItem } from 'app/shared-components/FormController';
import { Editor } from '@progress/kendo-react-editor';
import NumberTextField from 'app/shared-components/NumberTextField';
import { formatCurrency, uploadImageGetUUID } from 'app/helper/general.helper';
import { ImageComponent, CategoryComponentMultiSelect } from './ProductDetail';
import { useSelector } from 'react-redux';
import { Grid, GridNoRecords, GridColumn as Column } from '@progress/kendo-react-grid';
import { ProductActiveValue, ItemNumberCell } from 'app/kendo/CustomCell';
import ImagePopOver from 'app/shared-components/ImagePopOver';
import { withStyles } from '@material-ui/core/styles';

const StyledListItem = withStyles(theme => ({
  gutters: {
    paddingLeft: 0
  }
}))(ListItem);

const schema = yup.object().shape({
  name: yup.string().typeError(MSG_REQUIRED).required(MSG_REQUIRED),
  unit: yup.string().required(MSG_REQUIRED), //.typeError(MSG_REQUIRED).required(MSG_REQUIRED),
  weight: yup.number().min(0, MSG_REQUIRED).typeError(MSG_REQUIRED).required(MSG_REQUIRED),
  price: yup.number().typeError(MSG_REQUIRED).required(MSG_REQUIRED),
  description: yup.string().nullable(), //.typeError(MSG_REQUIRED).required(MSG_REQUIRED),
  // image: yup.string().typeError(MSG_REQUIRED).required(MSG_REQUIRED),
  is_coop_xtra: yup.boolean().typeError(MSG_REQUIRED).required(MSG_REQUIRED),
  is_ecology: yup.boolean().typeError(MSG_REQUIRED).required(MSG_REQUIRED),
  is_frozen: yup.boolean().typeError(MSG_REQUIRED).required(MSG_REQUIRED),
  status: yup.number().typeError(MSG_REQUIRED).required(MSG_REQUIRED),
  store_id_list: yup.array().nullable(), //.typeError(MSG_REQUIRED).required(MSG_REQUIRED),
  item_number: yup.array().nullable(), //.typeError(MSG_REQUIRED).required(MSG_REQUIRED),
  barcode: yup.string().nullable(), //.typeError(MSG_REQUIRED).required(MSG_REQUIRED),
  brand_id: yup.number().nullable(), //.typeError(MSG_REQUIRED).required(MSG_REQUIRED),
  tag_id_list: yup.array().nullable(), //.typeError(MSG_REQUIRED).required(MSG_REQUIRED),
  // store_price_list: yup.array().required(MSG_REQUIRED),
  base_value: yup.number().nullable(), //.typeError(MSG_REQUIRED).required(MSG_REQUIRED),
});

let goToProductList = false;

const ProductForm = props => {
  const cache = useSelector(({ fuse }) => fuse.cache);
  const [updating, setUpdating] = useState(false);
  const [itemModel, setItemModel] = useState(props.itemModel ?? { price: null });

  const ImageRef = useRef({
    imgUrl: null,
    imageInput: null,
  });
  const [imageRef2, setImageRef2] = useState();
  const { control, setValue, formState, handleSubmit, reset, trigger, setError, watch } = useForm({
    mode: 'onSubmit',
    defaultValues: itemModel,
    resolver: yupResolver(schema),
  });
  const setAllStorePriceList = price => {
    let newValue = {};
    cache.storeList.forEach(store => {
      newValue[store._id] = +price;
    });
    setValue('store_price_list', newValue);
  }
  const watchFields = watch(['price', 'is_frozen']);

  const { errors, dirtyFields } = formState;

  const goBackOrToProductList = () => {
    props.history.location.state?.fromList
      ? props.history.goBack()
      : props.history.push({
        pathname: `/product`,
      });
  };

  const onSubmit = async data => {
    let matchOldUuid = data.image ? data.image.match(/([a-f0-9]{32}).*?$/) : null;
    let oldUuid = matchOldUuid ? matchOldUuid[1] : null;
    // props.onSubmit(data);

    let value = {
      ...data,
      is_baked: data.category_id.includes(CATEGORY_ID_BAKE),
    };
    if (value.tag_id_list && value.tag_id_list.length > 0 && typeof value.tag_id_list[0] == 'object') {
      value.tag_id_list = value.tag_id_list.map(x => x._id);
    }
    const { imageInput, imgUrl } = ImageRef.current ?? imageRef2;
    let uuid = null;
    if (imageInput || imgUrl) {
      let formData = imageInput ?? new FormData();
      if ((imgUrl?.length ?? 0) > 0) {
        formData = new FormData();
        formData.append('img_url', imgUrl);
      }
      if (oldUuid) {
        formData.append('uuid', oldUuid);
        await uploadImageGetUUID(formData, () => props.showErrorMessage('Upload fejlede!'));
        uuid = oldUuid;
      } else {
        uuid = await uploadImageGetUUID(formData, () => props.showErrorMessage('Upload fejlede!'));
      }
      if (uuid) {
        value.image = uuid;
      } else {
        setUpdating(false);
        return;
      }
    } else if (typeof value._id == 'undefined') {
      props.showErrorMessage('Venligst indsæt billede');
      setUpdating(false);
      return;
    }

    //update
    if (value._id) {
      delete value.category;
      axios
        .put(`/products/${value._id}`, value)
        .then(response => {
          props.showSuccessMessage();
          typeof props.setProductList === 'function' &&
            props.setProductList(
              props.productList.map(product => {
                if (product._id == response.data.data._id) {
                  return {
                    ...product,
                    ...response.data.data,
                  };
                }
                return product;
              }),
            );
          goToProductList && goBackOrToProductList();
        })
        .catch(error => {
          props.showErrorMessage();
        });
    } else {
      //add
      let result = await props.onSubmit(value);
      if (result) {
        props.cancel();
      } else {
        setItemModel(value);
        reset(value);
      }
    }
    setUpdating(false);
  };

  const remove = dataItem => {
    if (!props.pagePermission.delete) {
      return;
    }

    axios
      .delete(`/products/${dataItem._id}`)
      .then(response => {
        props.showSuccessMessage();
        props.setProductList && props.setProductList(props.productList.filter(product => product._id != dataItem._id));
        props.closeDialog();
        goBackOrToProductList();
      })
      .catch(error => {
        props.showErrorMessage();
      });
  };

  const AssociatedRelatedComponent = propsCell => {
    const handleChange = (e, index, value) => {
      propsCell.handleChange(e, index, value);
    };

    const handleAdd = dataItem => {
      props.setProductMap({
        ...props.productMap,
        [dataItem._id]: dataItem,
      });
      propsCell.handleAdd(dataItem);
    };

    const handleRemove = index => {
      propsCell.handleRemove(index);
    };

    const AmountInput = propsCell => {
      const { dataItem } = propsCell;
      let index = propsCell.value.findIndex(x => x._id == dataItem._id);
      const [value, setValue] = useState(propsCell.value[index].amount ?? 0);
      return <NumberTextField
        value={value}
        onChange={e => {
          setValue(e.target.value);
        }}
        onBlur={e => {
          handleChange(e, index, parseInt(value));
        }}
      />
    }
    if (!!props.productMap) {
      return (
        <div className="mt-20">
          <div className="flex justify-around mb-5">
            <label style={{ width: '170px' }}>{propsCell.type == 'associated' ? 'Associeret produkt' : 'Relaterede produkt'}</label>
            <div style={{ width: '100%' }}>
              <ProductSearch fullWidth={true} onChange={handleAdd} />
            </div>
          </div>
          <Grid data={propsCell.value ? propsCell.value.map(x => props.productMap[x._id ?? x]) : []}>
            <GridNoRecords>{MSG_NO_DATA}</GridNoRecords>
            <Column field="item_number" title="Varenr." width="85" cell={ItemNumberCell} />
            <Column
              field="image"
              title="Billede"
              width="80" 
              cell={propsCell => (
                <td >
                  <ImagePopOver src={propsCell.dataItem.image} />
                </td>
              )}
            />
            <Column field="name" title="Navn" cell={({ dataItem }) => {
              return <td>
                <p>{dataItem.name}</p>
                <p>{formatCurrency(dataItem.price)}</p>
                Aktiv: <ProductActiveValue status={dataItem.status} />
              </td>
            }} />
            {propsCell.type == 'associated' && (
              <Column field="amount" title="Antal" width="60" cell={({ dataItem }) => {
                return <td>
                  <AmountInput {...propsCell} dataItem={dataItem} />
                </td>
              }} />
            )}
            <Column width="50" 
              cell={({ dataItem }) => {
                let index = propsCell.value.findIndex(x => (x._id ?? x) == dataItem._id);
                return (
                  <td>
                    <IconButton color="secondary" size="small" onClick={() => {
                      handleRemove(index)
                    }}>
                      <ClearIcon fontSize="small"/>
                    </IconButton>
                  </td>
                )
              }}
            />
          </Grid>
        </div >
      );
    }
    return <LoadingPanel />;
  };

  const DescriptionComponent = useCallback(propsCell => {
    return (
      <Editor
        tools={TOOL_EDITOR}
        contentStyle={{
          height: 200,
        }}
        defaultContent={propsCell.value ?? ''}
        onChange={e => {
          propsCell.onChange(e.html);
        }}
      />
    );
  }, []);

  const WeightListComponent = useCallback(propsCell => {
    const handleChange = (e, index, value) => {
      let newValue = [...propsCell.value];
      newValue[index] = value;
      propsCell.onChange(newValue);
    };
    const handleAdd = () => {
      if (propsCell.value) {
        propsCell.onChange([...propsCell.value, 0]);
      } else {
        propsCell.onChange([0]);
      }
    };
    const handleRemove = index => {
      let newValue = [...propsCell.value];
      newValue.splice(index, 1);
      propsCell.onChange(newValue);
    };
    return (
      <div className="mt-10">
        <div className="flex">
          <label style={{ width: '85px' }}>Vægtliste (g)</label>
          <IconButton type="button" color="primary" style={{ height: '20px', padding: 0 }} onClick={handleAdd}>
            <Icon>add</Icon>
          </IconButton>
        </div>
        <div>
          {!!propsCell.value
            ? propsCell.value.map((x, i) => {
              return (
                <div className="mt-5" key={i}>
                  <NumberTextField
                    onChange={e => {
                      handleChange(e, i, e.target.value);
                    }}
                    value={x}
                    style={{
                      width: '100px',
                    }}
                  />
                  <IconButton
                    type="button"
                    color="secondary"
                    size="small"
                    style={{ height: '20px', marginTop: '5px' }}
                    onClick={() => {
                      handleRemove(i);
                    }}>
                    <ClearIcon fontSize="small"/>
                  </IconButton>
                </div>
              );
            })
            : null}
        </div>
      </div>
    );
  }, []);

  if (!cache.categoryList || !props.categoryTree || !itemModel) {
    return <LoadingPanel />;
  } else {
    return (
      <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
        <DialogTitle className="w-900 text-center">
          {itemModel._id && (
            <IconButton style={{ float: 'left', height: '30px' }} title="Back" onClick={() => goBackOrToProductList()}>
              <Icon>arrow_back</Icon>
            </IconButton>
          )}
          <div>{itemModel._id ? 'Opdater produkt' : 'Opret produkt'}</div>
        </DialogTitle>
        <DialogContent style={{ height: 'calc(100vh - 280px)' }}>
          {updating ? <LoadingPanel /> : null}
          <div>
            <div className="flex">
              <div style={{ width: '280px', borderRight: 'solid 1px rgb(0,0,0,0.12)' }}>
                <div className='flex'>
                  <Controller
                    name="store_id_list"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <span style={{lineHeight: '25px'}}>Tilgængelighed butikker</span>
                        <List className="mt-5">
                          {cache.storeList.map(store => {
                            const labelId = `checkbox-list-label-${store._id}`;
                            return (
                              <StyledListItem
                                style={{ height: '20px', marginTop: '10px', width: '200px' }}
                                key={store._id}
                                role={undefined}
                                dense
                                button
                                onClick={e => {
                                  if (field.value && field.value.includes(store._id)) {
                                    let newIdList = field.value.filter(x => x != store._id);
                                    field.onChange(newIdList);
                                  } else {
                                    if (field.value) {
                                      field.onChange([...field.value, store._id]);
                                    } else {
                                      field.onChange([store._id]);
                                    }
                                  }
                                }}>
                                <ListItemIcon style={{ minWidth: '10px' }}>
                                  <Checkbox
                                    edge="start"
                                    size='small'
                                    color="primary"
                                    checked={field.value ? field.value.includes(store._id) : false}
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{ 'aria-labelledby': labelId }}
                                  />
                                </ListItemIcon>
                                <ListItemText id={labelId} primary={`${store.name}`} />
                              </StyledListItem>
                            );
                          })}
                        </List>
                      </div>
                    )}
                  />
                  <Controller
                    name="store_price_list"
                    control={control}
                    render={({ field }) => {
                      let valueToSetAll = useRef(watchFields[0] ?? 0);
                      return (
                        <div>
                          <NumberTextField
                            style={{
                              width: '65px',
                            }}
                            defaultValue={watchFields[0] ?? 0}
                            onChange={e => {
                              valueToSetAll.current = +e.target.value;
                            }}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">
                                <IconButton color="secondary" size="small" onClick={() => {
                                  setAllStorePriceList(valueToSetAll.current);
                                }}>
                                  <Icon color="primary" fontSize='small'>copy</Icon>
                                </IconButton>
                              </InputAdornment>,
                            }}
                          />
                          <List>
                            {cache.storeList.map(store => (
                              <ListItem style={{ height: '20px', marginTop: '10px', width: '80px' }} key={store._id} role={undefined} dense>
                                <NumberTextField
                                  value={field.value[store._id] ?? itemModel.price}
                                  onChange={e => {
                                    let newValue = { ...field.value };
                                    newValue[store._id] = e.target.value == '' ? '' : +e.target.value;
                                    field.onChange(newValue);
                                  }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </div>
                      );
                    }}
                  />
                </div>
              </div>
              <div style={{ width: '50%', minWidth: '500px', padding: '0 15px', borderRight: 'solid 1px rgb(0,0,0,0.12)' }}>
                <Controller
                  name="item_number"
                  control={control}
                  render={({ field }) => (
                    <FieldItem label="Varenr." gridCols="grid-cols-7" labelCols="col-span-1" childrenCols="col-span-6" marginTop="">
                      <TextField
                        {...field}
                        value={field.value ? field.value[0] ?? '' : ''}
                        onChange={e => {
                          let newValue = field.value ? [...field.value] : [];
                          newValue[0] = e.target.value;
                          field.onChange(newValue);
                        }}
                        className="w-1/3 mr-10"
                        id="item_number-1"
                        error={!!errors.item_number}
                        helperText={errors?.item_number?.message}
                      />
                      <TextField
                        {...field}
                        value={field.value ? field.value[1] ?? '' : ''}
                        onChange={e => {
                          let newValue = field.value ? [...field.value] : [];
                          newValue[1] = e.target.value;
                          field.onChange(newValue);
                        }}
                        className="w-1/3"
                        id="item_number-2"
                        error={!!errors.item_number}
                        helperText={errors?.item_number?.message}
                      />
                    </FieldItem>
                  )}
                />
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <FieldItem label="Navn *" gridCols="grid-cols-7" labelCols="col-span-1" childrenCols="col-span-6">
                      <TextField
                        {...field}
                        value={field.value ?? ''}
                        id="name"
                        fullWidth
                        error={!!errors.name}
                        helperText={errors?.name?.message}
                      />
                    </FieldItem>
                  )}
                />
                <Controller
                  name="category_id"
                  control={control}
                  render={({ field }) => {
                    return (
                      <div id="productForm-category-dropdown">
                        <FieldItem label="Kategori" gridCols="grid-cols-7" labelCols="col-span-1" childrenCols="col-span-6">
                          <CategoryComponentMultiSelect forDivId="productForm-category-dropdown" categoryTree={props.categoryTree} value={field.value} onChange={field.onChange} isFrozen={watchFields[1]} setValue={setValue} frozenIdList={props.frozenIdList} />
                        </FieldItem>
                      </div>
                    );
                  }}
                />
                <div className='flex justify-around mt-10'>
                  <Controller
                    name="brand_id"
                    control={control}
                    render={({ field }) => {
                      return (
                        <Autocomplete
                          {...field}
                          value={cache.brandList.find(x => x._id == field.value)}
                          options={cache.brandList}
                          getOptionSelected={(option, value) => option._id == value?._id}
                          renderInput={params => (
                            <FieldItem label="Producent" gridCols="grid-cols-7" labelCols="col-span-2" childrenCols="col-span-3">
                              <TextField
                                {...params}
                                style={{ width: '145px' }}
                                InputProps={{
                                  ...params.InputProps,
                                }}
                                value={params.InputProps.value ?? ''}
                                error={!!errors.brand_id}
                                helperText={errors?.brand_id?.message}
                              />
                            </FieldItem>
                          )}
                          onChange={(e, newValue) => {
                            field.onChange(newValue?._id ?? null);
                          }}
                          PopperComponent={props => <Popper {...props} style={{ width: '250px' }} />}
                          getOptionLabel={option => option.name}
                        />
                      );
                    }}
                  />
                  <Controller
                    name="barcode"
                    control={control}
                    render={({ field }) => {
                      return (
                        <FieldItem label="Stregkode" gridCols="grid-cols-7" labelCols="col-span-2" childrenCols="col-span-3">
                          <TextField
                            {...field}
                            value={field.value ?? ''}
                            id="barcode"
                            error={!!errors.barcode}
                            helperText={errors?.barcode?.message}
                          />
                        </FieldItem>
                      );
                    }}
                  />
                </div>
                <div className="flex">
                  <div style={{ width: '50%' }}>
                    <Controller
                      name="unit"
                      control={control}
                      render={({ field }) => (
                        <FieldItem label="Enhed *">
                          <TextField
                            {...field}
                            value={field.value ?? ''}
                            style={{ width: '70%' }}
                            id="unit"
                            error={!!errors.unit}
                            helperText={errors?.unit?.message}
                          />
                        </FieldItem>
                      )}
                    />
                  </div>
                  <div style={{ width: '50%' }}>
                    <Controller
                      name="weight"
                      control={control}
                      render={({ field }) => (
                        <FieldItem label="Vægt *" labelCols="col-span-3" childrenCols="col-span-3">
                          <NumberTextField
                            {...field}
                            id="weight"
                            value={field.value ?? ''}
                            error={!!errors.weight}
                            helperText={errors?.weight?.message}
                            InputProps={{
                              endAdornment: <InputAdornment position="end">g</InputAdornment>,
                            }}
                          />
                        </FieldItem>
                      )}
                    />
                  </div>
                </div>
                <Controller
                  name="price"
                  control={control}
                  render={({ field }) => (
                    <div className="flex">
                      <div style={{ width: '50%' }}>
                        <FieldItem label="Pris *">
                          <NumberTextField
                            {...field}
                            onChange={e => {
                              field.onChange(e);
                              if (!props.itemModel?._id) {
                                setAllStorePriceList(e.target.value);
                              }
                            }}
                            value={field.value ?? ''}
                            style={{ width: '70%' }}
                            id="price"
                            error={!!errors.price}
                            helperText={errors?.price?.message}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">DKK</InputAdornment>,
                            }}
                          />
                        </FieldItem>
                      </div>
                      <div style={{ width: '50%' }}>
                        <FieldItem label="Pris uden moms" labelCols="col-span-3" childrenCols="col-span-3">
                          <TextField
                            value={formatCurrency(field.value * 0.75, false)}
                            disabled={true}
                            id="price_no_tax"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">DKK</InputAdornment>,
                            }}
                          />
                        </FieldItem>
                      </div>
                    </div>
                  )}
                />

                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <div className="mt-10">
                      <label>Beskrivelse</label>
                      <DescriptionComponent value={field.value} onChange={field.onChange} />
                    </div>
                  )}
                />
                <Controller
                  name="image"
                  control={control}
                  render={({ field }) => <ImageComponent ref={ImageRef} value={field.value} onChange={field.onChange} onSave={setImageRef2} />}
                />
                <div className="mt-10 flex justify-around">
                  <Controller
                    name="is_coop_xtra"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label>Xtra</label>
                        <div className="flex">
                          <img
                            src="/assets/images/xtra.png"
                            style={{
                              width: 20,
                              height: 20,
                              margin: 'auto 0',
                            }}
                          />
                          <Switch
                            color="primary"
                            checked={field.value ?? false}
                            onChange={e => {
                              field.onChange(!field.value);
                            }}
                            id="is_coop_xtra"
                            label="is_coop_xtra"
                          />
                        </div>
                      </div>
                    )}
                  />
                  <Controller
                    name="is_ecology"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label>Økologi</label>
                        <div className="flex">
                          <img
                            src="/assets/icons/Ecology.svg"
                            style={{
                              width: 20,
                              height: 20,
                              margin: 'auto 0',
                            }}
                          />
                          <Switch
                            color="primary"
                            checked={field.value ?? false}
                            onChange={e => {
                              field.onChange(!field.value);
                            }}
                            id="is_ecology"
                            label="is_ecology"
                          />
                        </div>
                      </div>
                    )}
                  />
                  <Controller
                    name="is_frozen"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label>Frost</label>
                        <div className="flex">
                          <img
                            src="/assets/icons/Freeze.svg"
                            style={{
                              width: 20,
                              height: 20,
                              margin: 'auto 0',
                            }}
                          />
                          <Switch
                            color="primary"
                            checked={field.value ?? false}
                            onChange={e => {
                              field.onChange(!field.value);
                            }}
                            id="is_frozen"
                            label="is_frozen"
                          />
                        </div>
                      </div>
                    )}
                  />
                </div>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => {
                    return (
                      <>
                        <div className="flex">
                          <div>
                            <FormControlLabel
                              className="mt-10"
                              control={
                                <Checkbox
                                  color="primary"
                                  onChange={e => {
                                    if (field.value === PRODUCT_STATUS.active || field.value == PRODUCT_STATUS.activeOffer) {
                                      field.onChange(field.value - 1);
                                    } else {
                                      if (field.value == -1) {
                                        field.onChange(1);
                                      } else {
                                        field.onChange(field.value + 1);
                                      }
                                    }
                                  }}
                                  checked={field.value == PRODUCT_STATUS.active || field.value == PRODUCT_STATUS.activeOffer}
                                />
                              }
                              label="Aktiv"
                            />
                          </div>
                          <div>
                            <FormControlLabel
                              className="mt-10"
                              control={<Checkbox color="primary" disabled checked={field.value >= 2} />}
                              label="Aktiv i tilbudsperiode"
                            />
                          </div>
                          <div>
                            <FormControlLabel
                              className="mt-10"
                              control={
                                <Checkbox
                                  color="primary"
                                  onChange={e => {
                                    if (field.value == -1) {
                                      field.onChange(0);
                                    } else {
                                      field.onChange(-1);
                                    }
                                  }}
                                  checked={field.value == -1}
                                />
                              }
                              label="Associeret"
                            />
                          </div>
                          <div>
                            <Controller
                              name="just_backend"
                              control={control}
                              render={({ field }) => (
                                <FormControlLabel
                                  className="mt-10"
                                  control={
                                    <Checkbox
                                      color="primary"
                                      onChange={e => {
                                        field.onChange(!field.value);
                                      }}
                                      checked={field.value ?? false}
                                    />
                                  }
                                  label="Kun i backend"
                                />
                              )}
                            />
                          </div>
                        </div>
                      </>
                    );
                  }}
                />
              </div>
              <div style={{ width: '50%', minWidth: '500px', marginLeft: '15px' }}>
                <div className="flex">
                  <div>
                    <Controller
                      name="tag_id_list"
                      control={control}
                      render={({ field }) => {
                        return (
                          <Autocomplete
                            multiple
                            value={field.value ? cache.tagList.filter(x => field.value.includes(x._id)) : []}
                            options={cache.tagList}
                            getOptionSelected={(option, value) => option._id === value._id}
                            renderInput={params => (
                              <TextField
                                {...params}
                                label="Tagliste"
                                InputProps={{
                                  ...params.InputProps,
                                }}
                                value={params.InputProps.value}
                                fullWidth
                                error={!!errors.tag_id_list}
                                helperText={errors?.tag_id_list?.message}
                              />
                            )}
                            onChange={(e, newValue) => {
                              field.onChange(newValue.map(x => x._id));
                            }}
                            PopperComponent={props => <Popper {...props} style={{ width: '500px' }} />}
                            getOptionLabel={option => option.name}
                          />
                        );
                      }}
                    />
                    <Controller
                      name="associated_list"
                      control={control}
                      render={({ field }) => {
                        const handleChange = (e, index, value) => {
                          let newValue = [...field.value];
                          newValue[index]['amount'] = value;
                          field.onChange(newValue);
                        };

                        const handleAdd = dataItem => {
                          let newValue = field.value ? [...field.value] : [];
                          if (newValue.map(x => x._id).includes(dataItem._id)) {
                            return;
                          }
                          newValue.push({
                            _id: dataItem._id,
                            amount: 0,
                          });
                          field.onChange(newValue);
                        };

                        const handleRemove = index => {
                          let newValue = [];
                          field.value.forEach((x, i) => {
                            if (i !== index) {
                              newValue.push(x);
                            }
                          });
                          field.onChange(newValue);
                        };
                        return (
                          <AssociatedRelatedComponent
                            type="associated"
                            onChange={field.onChange}
                            value={field.value}
                            handleChange={handleChange}
                            handleAdd={handleAdd}
                            handleRemove={handleRemove}
                          />
                        );
                      }}
                    />
                    <Controller
                      name="related_list"
                      control={control}
                      render={({ field }) => {
                        const handleAdd = dataItem => {
                          let newValue = field.value ? [...field.value] : [];
                          if (newValue.includes(dataItem._id)) {
                            return;
                          }
                          newValue.push(dataItem._id);
                          field.onChange(newValue);
                        };
                        const handleRemove = index => {
                          let newValue = [];
                          field.value.forEach((x, i) => {
                            if (i !== index) {
                              newValue.push(x);
                            }
                          });
                          field.onChange(newValue);
                        };
                        return (
                          <AssociatedRelatedComponent
                            type="related"
                            onChange={field.onChange}
                            value={field.value}
                            handleAdd={handleAdd}
                            handleRemove={handleRemove}
                          />
                        );
                      }}
                    />
                    <Controller
                      name="base_value"
                      control={control}
                      render={({ field }) => {
                        return (
                          <FieldItem label="Basisværdi (g)" gridCols="grid-cols-8" labelCols="col-span-2" childrenCols="col-span-6">
                            <NumberTextField
                              {...field}
                              value={field.value ?? ''}
                              width={100}
                              id="base_value"
                              error={!!errors.base_value}
                              helperText={errors?.base_value?.message}
                            />
                          </FieldItem>
                        );
                      }}
                    />
                    <Controller
                      name="weight_list"
                      control={control}
                      render={({ field }) => {
                        return <WeightListComponent value={field.value} onChange={field.onChange} />;
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
        <CommandInForm
          pagePermission={props.pagePermission}
          remove={remove}
          dataItem={itemModel}
          openDialog={props.openDialog}
          closeDialog={() => {
            goBackOrToProductList();
            props.closeDialog();
          }}
          save={() => {
            goToProductList = false;
            handleSubmit(onSubmit)();
          }}
          secondButton={!props.itemModel?._id ? null : {
            label: 'Gem og gå til oversigt',
            onClick: () => {
              goToProductList = true;
              handleSubmit(onSubmit)();
            },
            color: 'default',
          }}
        />
      </form >
    );
  }
};

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
    pagePermission: getPagePermission('product', auth.user),
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ProductForm));

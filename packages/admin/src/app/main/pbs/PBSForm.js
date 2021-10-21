import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';

import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Input from '@material-ui/core/Input';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import { Typography, TextField, TextareaAutosize } from '@material-ui/core';

import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { MSG_REQUIRED } from 'app/constants';

import * as yup from 'yup';
import CommandInForm from 'app/kendo/CommandInForm';
import MenuItem from '@material-ui/core/MenuItem';
import axios from 'app/axios';
const schema = yup.object().shape({
  key: yup.string().required(MSG_REQUIRED),
  name: yup.string().required(MSG_REQUIRED),
  // value: yup.any().required(MSG_REQUIRED)
});

const PBSForm = forwardRef((props, ref) => {
  const [type, setType] = useState(!!props.dataItem ? typeof props.dataItem.value : 'string');
  const { control, formState, handleSubmit } = useForm({
    mode: 'onSubmit',
    defaultValues: props.dataItem,
    resolver: yupResolver(schema)
  });
  const { errors, dirtyFields, isDirty } = formState;
  useImperativeHandle(ref, () => {
    return isDirty;
  });
  const onSubmit = async (dataItem) => {
    axios
      .put(`/settings/${dataItem._id}`, {
        key: dataItem.key.trim(),
        name: dataItem.name.trim(),
        value: dataItem.value,
      })
      .then(response => {
        props.setSettingList(
          props.settingList.map(setting => {
            if (setting._id === response.data.data._id) {
              return response.data.data;
            }
            return setting;
          }),
        );
        props.showSuccessMessage();
      })
      .catch(error => { });
  }
  return (
    <form style={{ width: '50%' }} onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
      <DialogTitle className="text-center">Opdater PBS indstilling</DialogTitle>
      <DialogContent>
        <div className="mt-10">
          <Controller
            name="value"
            control={control}
            render={({ field }) => {
              let listKeyValue = [];
              let oldKeys = Object.keys(props.dataItem.value);
              for (const key in field.value) {
                listKeyValue.push({
                  key,
                  value: field.value[key].value,
                  name: field.value[key].name,
                  type: typeof field.value[key].value,
                  new: !oldKeys.includes(key)
                });
              }
              const handleOnChange = e => {
                switch (e.target.name) {
                  case 'key': {
                    let newValue = {};
                    for (const key in field.value) {
                      if (key == e.target.defaultValue) {
                        newValue[e.target.value] = field.value[key];
                      } else {
                        newValue[key] = field.value[key];
                      }
                    }
                    return field.onChange(newValue);
                  }
                  case 'type': {
                    let newValue = { ...field.value };
                    if (e.target.value == 'number') {
                      let parseValue = parseFloat(field.value[e.target.key]);
                      newValue[e.target.key] = isNaN(parseValue) ? 0 : parseValue;
                    } else {
                      newValue[e.target.key] = newValue[e.target.key].toString();
                    }
                    return field.onChange(newValue);
                  }
                  case 'name': {
                    let newValue = { ...field.value };
                    if (e.target.type == 'number') {
                      let parseValue = parseFloat(e.target.value);
                      newValue[e.target.key].name = isNaN(parseValue) ? 0 : parseValue;
                    } else {
                      newValue[e.target.key].name = e.target.value;
                    }
                    return field.onChange(newValue);
                  }
                  case 'value': {
                    let newValue = { ...field.value };
                    if (e.target.type == 'number') {
                      let parseValue = parseFloat(e.target.value);
                      newValue[e.target.key].value = isNaN(parseValue) ? 0 : parseValue;
                    } else {
                      newValue[e.target.key].value = e.target.value;
                    }
                    return field.onChange(newValue);
                  }
                }
              }
              return (
                <>
                  {!props.dataItem?._id && <IconButton id="add-button" type="button" color="primary" onClick={e => {
                    field.onChange({
                      ...field.value,
                      '': ''
                    });
                  }}
                    style={{
                      padding: 0,
                      verticalAlign: 'bottom'
                    }}
                  >
                    <Icon>add</Icon>
                  </IconButton>}
                  {listKeyValue.map((x, index) => {
                    return (
                      <div key={index} className='flex mt-10'>
                        <div style={{ width: '200px' }}>{x.name}</div>
                        {typeof x.value == 'string' && x.value.length >= 25 ?
                          <TextareaAutosize
                            maxRows={3}
                            minRows={3}
                            style={{
                              width: 500,
                              marginLeft: 40
                            }}
                            id='value'
                            type='text'
                            name='value'
                            value={x.value}
                            onChange={e => {
                              handleOnChange({
                                ...e,
                                target: {
                                  ...e.target,
                                  name: 'value',
                                  key: x.key,
                                  type: x.type,
                                }
                              })
                            }}
                          />
                          :
                          <Input type={x.type} name='value' style={{ width: 500, marginLeft: '40px' }} value={x.value} onChange={e => {
                            handleOnChange({
                              ...e,
                              target: {
                                ...e.target,
                                name: 'value',
                                key: x.key,
                                type: x.type,
                              }
                            })
                          }
                          } />
                        }
                      </div>
                    )
                  })}
                </>
              )
            }}
          />
        </div>
      </DialogContent>
      <CommandInForm {...props} itemModel={props.dataItem} />
    </form>
  );
});

export default PBSForm;

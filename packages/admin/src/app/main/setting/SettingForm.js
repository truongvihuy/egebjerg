import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';

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

const GeneralSettingForm = forwardRef((props, ref) => {
  const isDirty = useRef(false);
  useImperativeHandle(ref, () => {
    return isDirty.current;
  });
  const onSubmit = async (e) => {
    e.preventDefault();
    if (isDirty.current) {
      axios
        .put(`/settings`, props.settingList)
        .then(response => {
          console.log(response);
          props.setSettingList(response.data.data);
          props.showSuccessMessage();
          isDirty.current = false;
        })
        .catch(error => { });
    }
  }
  const onChange = (e, i) => {
    let newSettingList = [...props.settingList];
    newSettingList[i].value = (e.target.type == 'number') ? parseFloat(e.target.value) : e.target.value;
    isDirty.current = true;
    props.setSettingList(newSettingList);
  }
  return (
    <div>
      <DialogTitle className="text-center">Opdater indstilling</DialogTitle>
      <DialogContent>
        <div style={{ height: '650px' }}>
          {props.settingList.map((setting, i) => {
            return (
              <div key={i} className='flex mt-10'>
                <div style={{ width: '200px' }}>{setting.name}</div>
                {(typeof setting.value == 'string' && setting.value.length > 50) ?
                  <TextareaAutosize
                    minRows={3}
                    maxRows={3}
                    style={{
                      width: '500px',
                      marginLeft: '20px'
                    }}
                    id="value"
                    label="Værdi"
                    placeholder="Indtast værdi her"
                    type='text'
                    name='value' value={setting.value} onChange={e => {
                      onChange(e, i)
                    }}
                  />
                  : <Input type={typeof setting.value == 'string' ? 'text' : 'number'} name='value' style={{
                    width: '200px',
                    marginLeft: '20px'
                  }} value={setting.value} onChange={e => {
                    onChange(e, i)
                  }} />
                }
              </div>
            )
          })}
        </div>
      </DialogContent>
      <form onSubmit={onSubmit}>
        <CommandInForm {...props} dataItem={{ _id: null }} />
      </form>
    </div >
  );
});

export default GeneralSettingForm;

import { useState, useEffect } from 'react';

import { Checkbox, DialogContent, DialogTitle, TextField } from '@material-ui/core';

import CommandInForm from 'app/kendo/CommandInForm';

import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { MSG_REQUIRED, TASK_STATUS, MSG_MAX, MSG_MIN } from 'app/constants';
import * as yup from 'yup';
import NumberTextField from 'app/shared-components/NumberTextField';

const schema = yup.object().shape({
  name: yup.string().required(MSG_REQUIRED),
  config: yup.object().shape({
    start_time: yup.number().min(0, MSG_MIN + ' 0').max(23, MSG_MAX + ' 23').required(MSG_REQUIRED),
    end_time: yup.number().min(0, MSG_MIN + ' 0').max(23, MSG_MAX + ' 23').required(MSG_REQUIRED),
    time_cycle: yup.number().required(MSG_REQUIRED),
    day_cycle: yup.array().required(MSG_REQUIRED),
  }).required(MSG_REQUIRED)
});

const TaskForm = props => {
  const { control, formState, handleSubmit, reset } = useForm({
    mode: 'onSubmit',
    defaultValues: props.dataItem,
    resolver: yupResolver(schema),
  });
  const { errors } = formState;
  const onSubmit = data => {
    props.onSubmit(data);
  };
  const DayOfWeekComponent = propsCell => {
    let dayList = [
      { name: 'Mo', value: 1, },
      { name: 'Tu', value: 2, },
      { name: 'We', value: 3, },
      { name: 'Th', value: 4, },
      { name: 'Fr', value: 5, },
      { name: 'Sa', value: 6, },
      { name: 'Su', value: 0, },
    ];
    const handleCheckAll = () => {
      if (propsCell.value.length > 0) {
        propsCell.onChange([]);
      } else {
        propsCell.onChange([0, 1, 2, 3, 4, 5, 6]);
      }
    }
    return <div className='mt-10'>
      <label>
        <Checkbox color='primary' onClick={handleCheckAll} checked={propsCell.value.length == 7} /> All
      </label>
      {dayList.map((x, index) => {
        return <label key={index}>
          <Checkbox key={index} color='primary' checked={propsCell.value.includes(x.value)} onClick={() => {
            if (propsCell.value.includes(x.value)) {
              propsCell.onChange(propsCell.value.filter(day => day != x.value));
            } else {
              propsCell.onChange([...propsCell.value, x.value]);
            }
          }} />{x.name}
        </label>
      })}
    </div>
  }
  const ConfigComponent = propsCell => {
    return (
      <div className='mt-10'>
        <div className='flex justify-around'>
          <NumberTextField
            value={propsCell.value.start_time}
            onChange={e => { propsCell.onChange({ ...propsCell.value, start_time: e.target.value }) }}
            id="start_time"
            label="Start hour *"
            error={!!errors.config?.start_time}
            helperText={errors?.config?.start_time?.message}
          />
          <NumberTextField
            value={propsCell.value.end_time}
            onChange={e => { propsCell.onChange({ ...propsCell.value, end_time: e.target.value }) }}
            id="end_time"
            label="End hour *"
            error={!!errors.config?.end_time}
            helperText={errors?.config?.end_time?.message}
          />
          <NumberTextField
            value={propsCell.value.time_cycle}
            onChange={e => { propsCell.onChange({ ...propsCell.value, time_cycle: e.target.value }) }}
            id="time_cycle"
            label="Time cycle *"
            error={!!errors.config?.time_cycle}
            helperText={errors?.config?.time_cycle?.message}
          />
        </div>
        <DayOfWeekComponent value={propsCell.value.day_cycle ?? []} onChange={value => propsCell.onChange({ ...propsCell.value, day_cycle: value })} />
      </div>
    )
    return
  }
  return (
    <form className="w-500" onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
      <DialogTitle className="text-center">{props.dataItem._id ? 'Opdater Task' : 'Opret Task'}</DialogTitle>
      <DialogContent>
        <Controller
          name="name"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              id="name"
              label="Navn *"
              fullWidth
              autoFocus
              error={!!errors.name}
              helperText={errors?.name?.message}
            />
          )}
        />

        <Controller
          name="config"
          control={control}
          defaultValue={{}}
          render={({ field }) => (
            <ConfigComponent value={field.value} onChange={field.onChange} />
          )}
        />
      </DialogContent>
      <CommandInForm {...props} />
    </form>
  );
};

export default TaskForm;

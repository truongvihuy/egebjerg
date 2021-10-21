import { useCallback, useEffect } from 'react';

import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Typography, TextField } from '@material-ui/core';

import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { MSG_REQUIRED, TOOL_EDITOR, DEFAULT_FONT } from 'app/constants';

import * as yup from 'yup';
import CommandInForm from 'app/kendo/CommandInForm';

import { Editor } from "@progress/kendo-react-editor";

const schema = yup.object().shape({
  key: yup.string().required(MSG_REQUIRED),
  name: yup.string().required(MSG_REQUIRED),
  // subject: yup.string().required(MSG_REQUIRED),
  content: yup.string().required(MSG_REQUIRED),
});

const MailForm = props => {
  const { control, formState, handleSubmit, reset } = useForm({
    mode: 'onSubmit',
    defaultValues: props.dataItem,
    resolver: yupResolver(schema)
  });
  useEffect(() => {
    let editor = document.getElementsByClassName('k-editor')[0];
    let iFrame = editor.querySelector('iframe');
    iFrame.contentDocument.querySelector('.k-content').setAttribute("style", `font-family: ${DEFAULT_FONT};`)
  }, []);
  const { errors } = formState;

  const ContentComponent = useCallback((propsCell) => {
    return <Editor
      tools={TOOL_EDITOR}
      contentStyle={{
        height: 340,
      }}
      defaultContent={propsCell.value}
      onChange={e => {
        propsCell.onChange(e.html)
      }}
    />
  }, [])
  const onSubmit = data => {
    let match = null;
    let regexp = /<[^/>]+>\s+/;
    while ((match = regexp.exec(data.content)) !== null) {
      let replace = match[0].trim();
      let numberSpace = match[0].split(' ').length - 1;
      for (let i = 0; i < numberSpace; i++) {
        replace = replace + '&nbsp;';
      }
      data.content = data.content.replace(match[0], replace);
    }

    return props.onSubmit(data);
  }
  return (
    <form style={{ width: '550px' }} onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off"
      onKeyDown={e => {
        let key = e.charCode || e.keyCode || 0;
        if (key == 13) {
          e.preventDefault();
        }
      }}
    >
      <DialogTitle className="text-center">{props.dataItem._id ? 'Opdater Email' : 'Opret Email'}</DialogTitle>
      <DialogContent>
        <Controller
          name="key"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              disabled={!!props.dataItem._id}
              className="mt-10"
              id="key"
              label="Nøgle *"
              autoFocus
              fullWidth
              error={!!errors.key}
              autoFocus
              helperText={errors?.key?.message}
            />
          )}
        />
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField {...field} className="mt-10" id="name" label="Navn *" fullWidth error={!!errors.name} helperText={errors?.name?.message} />
          )}
        />
        {props.dataItem.instruction &&
          <div className="mt-10">
            <div>
              <Typography variant="caption" color="textSecondary">
                Instruction
              </Typography>
            </div>
            <div>
              <table style={{ width: '100%' }}>
                <tbody>
                  {Object.keys(props.dataItem.instruction).map(key => {
                    return <tr key={key} style={{ height: '20px' }} >
                      <td style={{ fontWeight: 500, width: '1%', whiteSpace: 'nowrap', paddingRight: '20px' }}>{`{${key}}`}</td>
                      <td >{props.dataItem.instruction[key]}</td>
                    </tr>
                  })}
                </tbody>
              </table>
            </div>
          </div>
        }
        <Controller
          name="subject"
          control={control}
          render={({ field }) => (
            <TextField {...field} className="mt-10" id="subject" label="Subject" fullWidth error={!!errors.name} helperText={errors?.name?.message} />
          )}
        />
        <div className="mt-10">
          <div>
            <Typography variant="caption" color="textSecondary">
              Content *
            </Typography>
          </div>
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <ContentComponent value={props.dataItem.content} onChange={field.onChange} />
            )}
          />
        </div>
      </DialogContent>
      <CommandInForm {...props} />
    </form>
  );
};
export default MailForm;
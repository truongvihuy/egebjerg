import React from 'react';
import axios from 'app/axios';
import DialogContent from '@material-ui/core/DialogContent';
import LoadingPanel from 'app/kendo/LoadingPanel';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import { DateTimePicker } from '@progress/kendo-react-dateinputs';
import Checkbox from '@material-ui/core/Checkbox';
import { Upload } from '@progress/kendo-react-upload';
import CommandInForm from 'app/kendo/CommandInForm';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { COLOR, MSG_REQUIRED } from 'app/constants';

import * as yup from 'yup';
import useForceUpdate from '@fuse/hooks/useForceUpdate';
import NumberTextField from 'app/shared-components/NumberTextField';
import { uploadImageGetUUID } from 'app/helper/general.helper';
import { useDispatch } from 'react-redux';
import { showErrorMessage } from 'app/store/fuse/messageSlice';
const PAGE_PATTERN = /(\d+).[a-zA-Z]+$/;

const schema = yup.object().shape({
  name: yup.string().required(MSG_REQUIRED),
  total_page: yup.number().required(MSG_REQUIRED).min(1, MSG_REQUIRED),
  from: yup.date().required(MSG_REQUIRED),
  to: yup.date().required(MSG_REQUIRED),
  active: yup.bool().required(MSG_REQUIRED),
});

const CustomUpLoad = React.forwardRef((props, ref) => {
  let [forceUpdate] = useForceUpdate();
  const dispatch = useDispatch();
  const filesRef = React.useRef(props.value.map(e => (e ? { uid: e.uid, name: e.slug } : null)));
  const fileNameErrorRef = React.useRef([]);
  const debouncedHandleShowError = React.useRef(_.debounce(() => {
    if (fileNameErrorRef.current.length) {
      const errorContent = (
        <div>
          {fileNameErrorRef.current.map(file => (<div>'{file.name}'</div>))}
          skal have sidenummer
        </div>
      )
      dispatch(showErrorMessage(errorContent));
      fileNameErrorRef.current = [];
    }
    forceUpdate();
  }, 500));

  React.useImperativeHandle(ref, () => ({
    onUpload,
  }));

  const handleInputFile = async (files, form) => {
    let rawFile = files[0];
    const imgReview = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        resolve(event.target.result);
      };
      reader.onerror = err => {
        reject(err);
      };
      reader.readAsDataURL(rawFile.getRawFile());
    });

    if (!(props.total > 0)) {
      props.onErrorTotal();
      return;
    }

    const found = rawFile.name.match(PAGE_PATTERN);
    if (found) {
      const page = +found[1] - 1;
      if (page < props.total) {
        for (let i = filesRef.current.length; i < page; i++) {
          filesRef.current[i] = null;
        }
        if (filesRef.current[page]) {
          form.formData.append('uuid', filesRef.current[page].uid);
        }
        filesRef.current[page] = {
          ...rawFile,
          name: rawFile.name,
          uid: filesRef.current[page] ? filesRef.current[page].uid : rawFile.uid,
          src: imgReview,
          formData: form.formData,
        };
      } else {
        fileNameErrorRef.current.push({
          name: rawFile.name,
        });
      }
    } else {
      fileNameErrorRef.current.push({
        name: rawFile.name,
      });
    }

    debouncedHandleShowError.current.cancel();
    debouncedHandleShowError.current();
  };

  const onUpload = async () => {
    let callList = filesRef.current.map(async e => {
      if (e) {
        if (e.formData) {
          // let response = await axios.post(thumborServerApiUrl, e.formData);
          let uuid = await uploadImageGetUUID(e.formData, () => props.showErrorMessage('Upload fejlede!'));
          // return { uid: response.data.image_location.replace('/', ''), slug: e.name };
          return { uid: uuid, slug: e.name };
        } else {
          return { uid: e.uid, slug: e.name };
        }
      }
      return null;
    });
    let data = await Promise.all(callList);
    return data;
  };

  return (
    <div className="mt-10" style={{ width: '100%' }}>
      <Upload multiple withCredentials={false} saveUrl={handleInputFile} />
      <div className="k-upload" style={{ borderTop: 'none' }}>
        <ul className="k-upload-files" style={{ height: '500px', overflow: 'auto' }}>
          {filesRef.current.map((files, index) => (
            <li className="k-file" key={index}>
              <span className="k-file-group-wrapper">
                <span className="k-file-group k-icon k-i-file-image"></span>
              </span>
              <span className="k-file-name-size-wrapper">
                {files ? (
                  <span className="k-file-name" title={files.name}>
                    {files.name}
                  </span>
                ) : (
                  <span className="k-file-name" style={{ color: COLOR.warning }}>
                    Billedet findes ikke
                  </span>
                )}
                {files?.size ? <span className="k-file-size">{files?.size / 1000} KB</span> : null}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});

const NewspaperForm = props => {
  const { control, formState, handleSubmit, setError } = useForm({
    mode: 'onSubmit',
    defaultValues: props.dataItem,
    resolver: yupResolver(schema),
  });
  const { errors } = formState;
  const uploadRef = React.useRef(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [total, setTotal] = React.useState(props.dataItem.total_page);

  const onSubmit = async data => {
    setIsUploading(true);
    try {
      let img_list = await uploadRef.current.onUpload();
      let sendData = {
        ...data,
        offer_list: {
          ...data.offer_list,
          offer_id_list: data.offer_list?.offer_id_list ? [...data.offer_list.offer_id_list] : [],
          product_id_list: data.offer_list?.product_id_list ? [...data.offer_list.product_id_list] : [],
        },
      };
      setIsUploading(false);
      if (!sendData.hasOwnProperty('offer_list')) {
        sendData.offer_list = {
          offer_id_list: [],
          product_id_list: [],
          img_list: img_list,
        };
      } else {
        sendData = {
          ...sendData,
          offer_list: {
            ...sendData.offer_list,
            img_list: img_list,
          },
        };
      }
      let i = sendData.offer_list.offer_id_list.length;
      let length = sendData.total_page;
      if (i !== length) {
        if (i < length) {
          while (i < length) {
            sendData.offer_list.offer_id_list.push([]);
            sendData.offer_list.product_id_list.push([]);
            i++;
          }
        } else {
          while (i > length) {
            if (sendData.offer_list.offer_id_list[i - 1].length) {
              setError('total_page', { message: 'Der er stadig tilbud på den side, du vil slette' });
              return;
            } else {
              sendData.offer_list.offer_id_list.pop();
              sendData.offer_list.product_id_list.pop();
            }
            i--;
          }
        }
      }
      props.onSubmit(sendData);
    } catch (e) {
      console.error(e);
      props.showErrorMessage('Upload fejlede!');
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
      {isUploading && <LoadingPanel width="960px" />}
      <DialogTitle className="text-center">{props.dataItem._id ? 'Opdatering tilbudsavis' : 'Opret tilbudsavis'}</DialogTitle>
      <DialogContent style={{ display: 'flex' }}>
        <div className="mr-10">
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField {...field} id="name" label="Navn *" fullWidth error={!!errors.name} helperText={errors?.name?.message} />
            )}
          />
          <Controller
            name="total_page"
            control={control}
            render={({ field }) => (
              <NumberTextField
                {...field}
                className="mt-10"
                id="total_page"
                label="Antal sider *"
                fullWidth
                onChange={e => {
                  field.onChange(e);
                  setTotal(e.target.value);
                }}
                error={!!errors.total_page}
                helperText={errors?.total_page?.message}
              />
            )}
          />
          <div style={{ display: 'flex' }}>
            <Controller
              name="from"
              control={control}
              render={({ field }) => (
                <div className={errors.from ? 'date-time-error' : ''} style={{ maxInlineSize: 'min-content' }}>
                  <DateTimePicker
                    value={field.value}
                    className="mt-10"
                    onChange={e => {
                      field.onChange(e.value);
                    }}
                  />
                  {errors.from && <p style={{ color: COLOR.warning }}>{MSG_REQUIRED}</p>}
                </div>
              )}
            />
            <Controller
              name="to"
              control={control}
              render={({ field }) => (
                <div className={errors.to ? 'date-time-error' : ''} style={{ maxInlineSize: 'min-content' }}>
                  <DateTimePicker
                    value={field.value}
                    className="mt-10"
                    onChange={e => {
                      field.onChange(e.value);
                    }}
                  />
                  {errors.to && <p style={{ color: COLOR.warning }}>{MSG_REQUIRED}</p>}
                </div>
              )}
            />
          </div>
          {props.dataItem._id && (
            <Controller
              name="active"
              control={control}
              render={({ field }) => (
                <label>
                  Aktiv
                  <Checkbox {...field} color="primary" checked={field.value} onChange={(e, value) => field.onChange(value)} disabled={true} />
                </label>
              )}
            />
          )}
        </div>
        <CustomUpLoad
          total={total}
          ref={uploadRef}
          value={props.dataItem.offer_list?.img_list ?? []}
          onErrorTotal={() => {
            setError('total_page', { message: MSG_REQUIRED });
          }}
        />
      </DialogContent>
      <CommandInForm {...props} isLoading={isUploading} />
    </form>
  );
};

export default NewspaperForm;

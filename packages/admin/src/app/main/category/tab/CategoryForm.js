import { useState, useMemo, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { DialogContent, DialogTitle, TextField, FormControlLabel, Checkbox } from '@material-ui/core';
import { TreeView, processTreeViewItems, handleTreeViewCheckChange } from '@progress/kendo-react-treeview';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { getImageSrc, MSG_REQUIRED } from 'app/constants';
import * as yup from 'yup';
import { Upload } from '@progress/kendo-react-upload';
import { connect } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';
import { showSuccessMessage, showErrorMessage } from 'app/store/fuse/messageSlice';
import config from 'config/config';
import axios from 'app/axios';
import CommandInForm from 'app/kendo/CommandInForm';
import LoadingPanel from 'app/kendo/LoadingPanel';
import { uploadImageGetUUID } from 'app/helper/general.helper';

const schema = yup.object().shape({
  name: yup.string().required(MSG_REQUIRED),
  // img: yup.string().required(MSG_REQUIRED),
  // active: yup.bool(),
  parent_id: yup.number().nullable(true),
  // order: yup.number(),
});

const textField = 'name';
const checkField = 'checked';
const expandField = 'expanded';
const subItemsField = 'items';
const dataItemKey = '_id';

const ImageComponent = forwardRef((propCell, ref) => {
  const [imgPreview, setImgPreview] = useState(propCell.value ? getImageSrc(propCell.value) : null);
  useEffect(() => {
    if (propCell.value) {
      setImgPreview(getImageSrc(propCell.value));
    }
  }, [propCell]);
  const imageInput = useRef(null);
  const imgUrl = useRef('');

  const handleChangeImgUrl = e => {
    setImgPreview(e.target.value);
    imgUrl.current = e.target.value;
  };

  useImperativeHandle(ref, () => {
    return {
      imageInput: imageInput.current,
      imgUrl: imgUrl.current,
    };
  });

  const handleInputFile = async (files, form, call) => {
    let rawFile = files[0].getRawFile();

    imageInput.current = form.formData;
    setImgPreview(
      await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = event => {
          resolve(event.target.result);
        };
        reader.onerror = err => {
          reject(err);
        };
        reader.readAsDataURL(rawFile);
      }),
    );
    return { uid: files[0].uid };
  };

  const handleRemoveFile = async (files, form, call) => {
    imageInput.current = null;
    setImgPreview(null);
    return { uid: files[0].uid };
  };
  return (
    <>
      <p>Billede</p>
      <TextField
        style={{ width: '100%' }}
        placeholder="Link til billede fra internettet"
        value={imgUrl.current}
        disabled={!!imageInput.current}
        onChange={handleChangeImgUrl}
      />
      <div className="mt-20">
        <Upload
          restrictions={{
            allowedExtensions: ['.jpg', '.png', '.svg', '.gif'],
          }}
          disabled={!!imgUrl.current}
          multiple={false}
          saveUrl={handleInputFile}
          removeUrl={handleRemoveFile}
        />
      </div>
      {imgPreview && (
        <div
          style={{
            width: '300px',
            height: '200px',
          }}>
          <img
            style={{
              margin: '20px auto',
              border: 'solid 1px',
              objectFit: 'contain',
              width: '200px',
              height: '200px',
            }}
            src={imgPreview.startsWith('http') ? imgPreview + `?t=${+new Date()}` : imgPreview}
          />
        </div>
      )}
    </>
  );
});

const CategoryForm = props => {
  const ImageRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const { control, formState, handleSubmit, reset } = useForm({
    mode: 'onSubmit',
    defaultValues: props.dataItem,
    resolver: yupResolver(schema),
  });
  const [check, setCheck] = useState({
    ids: [],
    idField: dataItemKey,
    applyCheckIndeterminate: true,
  });
  const [expanded, setExpanded] = useState({
    ids: [],
    idField: dataItemKey,
  });
  // const uploadRef = createRef();

  const { errors } = formState;

  const onCancel = () => {
    props.cancel();
  };

  const onSave = async data => {
    setUploading(true);
    let matchOldUuid = data.img ? data.img.match(/([a-f0-9]{32}).*?$/) : null;
    let oldUuid = matchOldUuid ? matchOldUuid[1] : null;
    let value = {
      ...props.dataItem,
      ...data,
    };
    const { imageInput, imgUrl } = ImageRef.current;
    let uuid = null;
    if (imageInput || imgUrl) {
      let formData = imageInput ?? new FormData();
      if ((imgUrl?.length ?? 0) > 0) {
        formData.append('img_url', imgUrl);
      }
      if (oldUuid) {
        formData.append('uuid', oldUuid);
        uuid = await uploadImageGetUUID(formData, () => props.showErrorMessage('Upload fejlede!'));
      } else {
        uuid = await uploadImageGetUUID(formData, () => props.showErrorMessage('Upload fejlede!'));
      }
      if (uuid) {
        value.img = uuid;
      } else {
        setUploading(false);
        return;
      }
    } else if (typeof value._id == 'undefined') {
      props.showErrorMessage('Venligst indsæt billede');
      setUploading(false);
      return;
    }

    if (value._id) {
      //update
      let result = await props.onSubmit(value, props.dataItem);
      if (result) {
        props.cancel();
      } else {
        reset(value);
      }
    } else {
      //add
      let children = props.dataTree;
      if (value.parent_id) {
        children = props.dataMap[value.parent_id][subItemsField] ?? [];
        value.level = props.dataMap[value.parent_id].level + 1;
      }
      if (children.length) {
        let lastItem = null;
        while (children.length) {
          children.forEach(e => {
            if (!lastItem || lastItem.order < e.order) {
              lastItem = e;
            }
          });
          children = lastItem[subItemsField] ?? [];
        }
        value.order = lastItem.order + 1;
      } else {
        value.order = props.dataMap[value.parent_id].order + 1;
      }
      let result = await props.onSubmit(value);
      if (result) {
        props.cancel();
      } else {
        reset(value);
      }
    }
    setUploading(false);
    // props.cancel();
  };

  // const onChange = (e) => {
  //   setItemModal({...data, [e.field]: e.value, });
  // };

  const onExpandChange = event => {
    let ids = expanded.ids.slice();
    const index = ids.indexOf(event.item._id);
    index === -1 ? ids.push(event.item._id) : ids.splice(index, 1);
    setExpanded({
      ids,
      idField: dataItemKey,
    });
  };

  const onCheckChange = (event, onChangeField) => {
    let parent_id = null;
    parent_id = event.item._id;
    onChangeField(parent_id);

    const settings = {
      singleMode: true,
      checkChildren: false,
      checkParents: false,
    };
    setCheck(handleTreeViewCheckChange(event, check, props.dataTree, settings));
  };
  const treeData = useMemo(
    () =>
      processTreeViewItems(props.dataTree, {
        expand: expanded,
        expandField: expandField,
        check: check,
        checkField: checkField,
        childrenField: subItemsField,
      }),
    [expanded, check, props.dataTree],
  );

  return (
    <form
      style={{
        width: props.dataItem._id ? '350px' : '600px',
      }}
      onSubmit={handleSubmit(onSave)}
      noValidate
      autoComplete="off">
      <DialogTitle className="text-center">{props.dataItem._id ? `Opdater katalog ${props.dataItem.name}` : 'Opret katalog'}</DialogTitle>
      <DialogContent>
        {uploading ? <LoadingPanel /> : null}
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              className="mb-10"
              id="name"
              label="Navn *"
              autoFocus
              error={!!errors.name}
              helperText={errors?.name?.message}
            />
          )}
        />
        <div className={props.dataItem._id ? 'flex' : 'flex justify-between'}>
          {props.dataItem._id ? null : (
            <div style={{ maxWidth: '50%' }}>
              <p>Forælder</p> {/* Parent */}
              <Controller
                name="parent_id"
                control={control}
                render={({ field }) => (
                  <TreeView
                    className="cat-tree-view-in-form"
                    data={treeData}
                    checkboxes
                    checkField={checkField}
                    onCheckChange={e => onCheckChange(e, field.onChange)}
                    textField={textField}
                    childrenField={subItemsField}
                    expandIcons
                    onExpandChange={onExpandChange}
                  />
                )}
              />
            </div>
          )}
          <div>
            <Controller
              name="img"
              control={control}
              render={({ field }) => <ImageComponent value={field.value} onChange={field.onChange} ref={ImageRef} />}
            />
          </div>
        </div>
        <Controller
          name="active"
          control={control}
          render={({ field }) => {
            return (
              <FormControlLabel
                className="mt-10"
                control={<Checkbox color="primary" onChange={field.onChange} checked={field.value ?? itemModel.active} />}
                label="Aktiv"
              />
            );
          }}
        />
      </DialogContent>
      <CommandInForm {...props} />
    </form>
  );
};
export default CategoryForm;

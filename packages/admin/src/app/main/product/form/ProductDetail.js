import { useState, useEffect, useRef, useImperativeHandle, forwardRef, useMemo, useCallback } from 'react';
import axios from 'app/axios';
import { connect } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';
import { showSuccessMessage, showErrorMessage } from 'app/store/fuse/messageSlice';
import LoadingPanel from 'app/kendo/LoadingPanel';
import { openDialog, closeDialog } from 'app/store/fuse/dialogSlice';
import { withRouter } from 'react-router-dom';
import ProductForm from './ProductForm';
import { Upload } from '@progress/kendo-react-upload';
import { TextField } from '@material-ui/core';
import { getPagePermission, getImageSrc, CATEGORY_ID_FROZEN } from 'app/constants';
import { TreeView, processTreeViewItems, handleTreeViewCheckChange } from '@progress/kendo-react-treeview';
import { useSelector } from 'react-redux';
import { MultiSelectTree, getMultiSelectTreeValue } from '@progress/kendo-react-dropdowns';
import { processMultiSelectTreeData, expandedState } from './multiselecttree-data-operations';

let frozenIdList = [];
const subItemsField = 'items';
const dataItemKey = '_id';

export const ImageComponent = forwardRef((propsCell, ref) => {
  const [imgPreview, setImgPreview] = useState(propsCell.value ? getImageSrc(propsCell.value) : null);
  useEffect(() => {
    setImgPreview(propsCell.value ? getImageSrc(propsCell.value) : null);
  }, [propsCell.value]);
  useEffect(() => {
    return () => {
      propsCell.onSave({
        imageInput: imageInput.current,
        imgUrl: imgUrl.current,
      });
    };
  }, []);
  const imageInput = useRef(null);
  const imgUrl = useRef('');

  const handleChangeImgUrl = e => {
    imgUrl.current = e.target.value;
    setImgPreview(e.target.value);
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
      <div className="mt-10 flex justify-around">
        <div>
          <img
            style={{
              objectFit: 'contain',
              width: '180px',
              height: '180px',
            }}
            src={imgPreview}
          />
        </div>
        <div>
          <TextField onChange={handleChangeImgUrl} label="Billed url fra internet" />
          <div className="mt-20">
            <Upload disabled={!!imgUrl.current} multiple={false} saveUrl={handleInputFile} removeUrl={handleRemoveFile} />
          </div>
        </div>
      </div>
    </>
  );
});
export const CategoryComponent = propsCell => {
  const [expandTree, setExpandTree] = useState({
    ids: [],
    idField: '_id',
  });
  const [check, setCheck] = useState({
    ids: propsCell.value,
    idField: dataItemKey,
    applyCheckIndeterminate: true,
  });
  const onExpandChange = event => {
    let ids = expandTree.ids.slice();
    const index = ids.indexOf(event.item._id);
    index === -1 ? ids.push(event.item._id) : ids.splice(index, 1);
    setExpandTree({
      ids,
      idField: '_id',
    });
  };

  const processDataTreeView = () => {
    return processTreeViewItems(propsCell.categoryTree.data, {
      check: check,
      expand: expandTree,
      childrenField: subItemsField,
    });
  };

  const onCheckChange = (event, onChangeField, fieldValue) => {
    let parent_id = event.item._id;
    let newCategoryId = [];
    if (fieldValue && fieldValue.includes(parent_id)) {
      newCategoryId = fieldValue.filter(x => x != parent_id);
    } else {
      if (fieldValue) {
        newCategoryId = [...fieldValue, parent_id];
      } else {
        newCategoryId = [parent_id];
      }
    }
    let checkFrozen = false;
    for (let i = 0; i < newCategoryId.length; i++) {
      if (propsCell.frozenIdList.includes(newCategoryId[i])) {
        checkFrozen = true;
        break;
      }
    }
    if (checkFrozen && propsCell.isFrozen === false) {
      propsCell.setValue('is_frozen', true);
    }
    onChangeField(newCategoryId);

    const settings = {
      singleMode: false,
      checkChildren: false,
      checkParents: false,
    };
    setCheck(handleTreeViewCheckChange(event, check, propsCell.categoryTree.data, settings));
  };

  return (
    <TreeView
      className="cat-tree-view-in-form"
      data={processDataTreeView()}
      textField="name"
      childrenField={subItemsField}
      expandIcons
      onExpandChange={onExpandChange}
      checkboxes={true}
      onCheckChange={e => {
        onCheckChange(e, propsCell.onChange, propsCell.value);
      }}
    />
  );
};
export const CategoryComponentMultiSelect = propsCell => {
  const categoryList = useSelector(({ fuse }) => fuse.cache.categoryList);
  const dataItemKey = '_id';
  const checkField = 'checkField';
  const checkIndeterminateField = 'checkIndeterminateField';
  const subItemsField = 'items';
  const expandField = 'expanded';
  const textField = 'name';
  const fields = {
    dataItemKey,
    checkField,
    checkIndeterminateField,
    expandField,
    subItemsField,
  };
  const [value, setValue] = useState(categoryList.filter(x => propsCell.value.includes(x._id)));
  const [expanded, setExpanded] = useState([propsCell.categoryTree.data[0][dataItemKey]]);

  /**
   * To close the dropdown when use on a dialog with onBlur, must use:
   * - state
   * - popupSettings with appendTo to define the container to which the Popup will be appended.
   **/ 
  const [isOpened, setIsOpened] = useState(false);

  const onCheckChange = event => {
    if (event.operation == 'clear') {
      return;
    }
    let newCategoryId = event.items[0]._id;
    let isNew = true;
    let newValue = [...value];
    // getMultiSelectTreeValue(propsCell.categoryTree.data, { ...event, value, ...fields });
    newValue = newValue.filter(x => {
      if (x._id == newCategoryId) {
        isNew = false;
        return false;
      } else {
        return true;
      }
    });
    if (isNew) {
      newValue.push(event.items[0]);
    }
    setValue(newValue);

    newValue = newValue.map(x => x[dataItemKey]);
    let checkFrozen = false;
    for (let i = 0; i < newValue.length; i++) {
      if (propsCell.frozenIdList.includes(newValue[i])) {
        checkFrozen = true;
        break;
      }
    }
    if (checkFrozen && propsCell.isFrozen == false) {
      propsCell.setValue('is_frozen', true);
    }
    propsCell.onChange(newValue);
    document.getElementsByClassName('k-widget k-dropdowntree')[1]?.focus();
  };
  const onExpandChange = useCallback(event => setExpanded(expandedState(event.item, dataItemKey, expanded)), [expanded]);
  const treeData = useMemo(
    () =>
      processMultiSelectTreeData(
        propsCell.categoryTree.data,
        {
          expanded,
          value,
        },
        fields,
      ),
    [expanded, value],
  );
  return (
    <MultiSelectTree
      style={{ width: '100%' }}
      data={treeData}
      value={value}
      onChange={onCheckChange}
      opened={isOpened}
      onFocus={e => {
        setIsOpened(true);
      }}
      onBlur={e => {
        setIsOpened(false);
      }}
      placeholder="Select ..."
      textField={textField}
      dataItemKey={dataItemKey}
      checkField={checkField}
      checkIndeterminateField={checkIndeterminateField}
      subItemsField={subItemsField}
      expandField={expandField}
      onExpandChange={onExpandChange}
      popupSettings={{ appendTo: propsCell.forDivId ? document.getElementById(propsCell.forDivId) : document.body }}
    />
  );
};
const ProductDetail = props => {
  const cache = useSelector(({ fuse }) => fuse.cache);
  const [productMap, setProductMap] = useState(null);
  const [categoryTree, setCategoryTree] = useState(null);
  const [itemModel, setItemModel] = useState(props.dataItem ?? { price: null });
  const goBackOrToProductList = () => {
    props.history.location.state?.fromList
      ? props.history.goBack()
      : props.history.push({
          pathname: `/product`,
        });
  };

  useEffect(async () => {
    let categoryListTmp = cache.categoryList;
    let itemTmp = itemModel;
    if (!itemModel.price && props.editId) {
      let found = await axios
        .get(`/products/${props.editId}`, {})
        .then(({ data }) => {
          itemTmp = data.data;
          setItemModel(data.data);
          return true;
        })
        .catch(error => {
          goBackOrToProductList();
          return false;
        });
      if (!found) {
        return;
      }
    }

    if (itemTmp) {
      let productIdList = itemTmp.related_list ? [...itemTmp.related_list] : [];
      if (itemTmp.associated_list) {
        itemTmp.associated_list.forEach(x => {
          if (!productIdList.includes(x._id)) {
            productIdList.push(x._id);
          }
        });
      }
      if (productIdList.length > 0) {
        await axios
          .get(`/products`, {
            params: {
              id_list: productIdList.join(','),
            },
          })
          .then(({ data }) => {
            let newProductMap = {};
            data.data.product_list.forEach(x => {
              newProductMap[x._id] = x;
            });
            setProductMap(newProductMap);
          });
      } else {
        setProductMap({});
      }
    } else {
      setProductMap({});
    }

    let map = {};
    let dataTree = [];
    let data = [];
    categoryListTmp.forEach(x => {
      data.push({ ...x });
    });
    data.forEach(item => {
      map[item._id] = item;
      if (item.parent_id) {
        if (!map[item.parent_id][subItemsField]) {
          map[item.parent_id][subItemsField] = [];
        }
        map[item.parent_id][subItemsField].push(item);
      }
    });
    data.forEach(item => {
      if (!item.parent_id) {
        dataTree.push({ ...map[item._id] });
      }
    });
    frozenIdList = [...map[CATEGORY_ID_FROZEN].children];
    setCategoryTree({ map, data: dataTree });
    return () => {
      frozenIdList = null;
    };
  }, []);

  if (!cache.categoryList || !categoryTree || !itemModel) {
    return <LoadingPanel />;
  } else {
    return (
      <ProductForm
        categoryTree={categoryTree}
        itemModel={itemModel}
        onSubmit={props.onSubmit}
        setProductList={props.setProductList}
        productList={props.productList}
        frozenIdList={frozenIdList}
        productMap={productMap}
        setProductMap={setProductMap}
      />
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ProductDetail));

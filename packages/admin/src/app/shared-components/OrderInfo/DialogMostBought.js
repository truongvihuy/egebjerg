import { useCallback, useEffect, useRef, useState } from 'react';
import { TextField, InputAdornment, CircularProgress, Dialog } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { PLACEHOLDER_PRODUCT } from 'app/constants';
import axios from 'app/axios';
import DialogContent from '@material-ui/core/DialogContent';
import { ProductOption } from './ProductOption';
import { isFreeNameProduct } from 'app/helper/general.helper';
import { merge, cloneDeep } from 'lodash';
import useForceUpdate from '@fuse/hooks/useForceUpdate';

const initSelect = {
  index: 0,
  focusInput: false,
};

export const DialogMostBought = ({ cartItemList, customer, onSelect, closeDialog, onAdd }) => {
  const [forceUpdate] = useForceUpdate();
  const [tmpCartItemList, setTmpCartItemList] = useState(cartItemList);
  const [textSearch, setTextSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const optionsRef = useRef(options);
  const noOption = useRef(false);
  const selectItem = useRef(initSelect);
  const orderHistory = useRef();
  const inputRef = useRef();
  const [stateDialog, setStateDialog] = useState({ open: false });

  const setSelectItem = useCallback((newSelect = initSelect) => {
    const prelistOption = orderHistory.current.querySelectorAll('.item-option');
    const nextlistOption = orderHistory.current.querySelectorAll('.item-option');

    prelistOption[selectItem.current.index]?.removeAttribute('aria-selected');
    nextlistOption[newSelect.index]?.setAttribute('aria-selected', 'true');

    if (nextlistOption[newSelect.index]) {
      const node = nextlistOption[newSelect.index];
      const nodeList = orderHistory.current;

      if (node.offsetTop < nodeList.scrollTop) {
        nodeList.scrollTop = node.offsetTop;
      }

      if (nodeList.scrollTop + nodeList.offsetHeight < node.offsetTop + node.offsetHeight) {
        nodeList.scrollTop = node.offsetTop + node.offsetHeight - nodeList.offsetHeight;
      }
    }

    selectItem.current = newSelect;
  }, []);

  useEffect(() => {
    optionsRef.current = options;
    setSelectItem();
  }, [options]);

  useEffect(() => {
    const handleKeyArrow = e => {
      let newSelect;
      let indexSelect;
      if (!selectItem.current.focusInput) {
        switch (e.code) {
          case 'ArrowUp':
            newSelect = cloneDeep(selectItem.current);
            indexSelect = newSelect.index - 1;
            newSelect.index = indexSelect > -1 ? indexSelect : optionsRef.current?.length - 1;
            setSelectItem(newSelect);
            break;
          case 'ArrowDown':
            newSelect = cloneDeep(selectItem.current);
            indexSelect = newSelect.index + 1;
            newSelect.index = indexSelect < optionsRef.current?.length ? indexSelect : 0;
            setSelectItem(newSelect);
            break;

          case 'NumpadEnter':
          case 'Enter':
            newSelect = cloneDeep(selectItem.current);
            newSelect.focusInput = true;
            setSelectItem(newSelect);
            forceUpdate();
            break;
          case 'Escape':
            closeDialog();
            break;
          case 'F3':
            inputRef.current.querySelector('input')?.focus();
            break;
          default:
            break;
        }
      } else {
        switch (e.code) {
          case 'Escape':
            e.preventDefault();
            newSelect = cloneDeep(selectItem.current);
            newSelect.focusInput = false;
            setSelectItem(newSelect);
            forceUpdate();
            break;
          case 'F3':
            newSelect = cloneDeep(selectItem.current);
            newSelect.focusInput = false;
            setSelectItem(newSelect);
            inputRef.current.querySelector('input')?.focus();
            forceUpdate();
            break;
          default:
            break;
        }
      }
    };
    document.addEventListener('keydown', handleKeyArrow);

    getApi();
    return () => {
      document.removeEventListener('keydown', handleKeyArrow);
    };
  }, []);

  const getApi = () => {
    if (customer.most_bought_list?.length) {
      const params = { status: 'active', id_list: customer.most_bought_list.join(',') };
      setLoading(true);
      axios
        .get('/products', { params })
        .then(({ data }) => {
          setLoading(false);
          setOptions(data.data.product_list);
        })
        .catch(e => {
          setLoading(false);
        });
    }
  }

  const onSelectOption = (product, focusInput) => {
    if (isFreeNameProduct(product._id)) {
      onSelect(product);
    } else {
      let newSelect = merge({}, selectItem.current, { focusInput: focusInput });
      setSelectItem(newSelect);
      forceUpdate();
    }
  }

  const onChangeCart = (nextValue, preValue, tab, index) => {
    if (isFreeNameProduct(nextValue.cart._id)) {
      onSelect(nextValue.product);
      return false;
    }
    if (tab !== selectItem.current.tab || index !== selectItem.current[tab]) {
      let newSelect = cloneDeep(selectItem.current);
      newSelect.tab = tab;
      newSelect[tab] = index;
      newSelect.focusInput = true;
      setSelectItem(newSelect);
    }

    const resultAddCart = onAdd(nextValue, preValue, false);
    if (resultAddCart.updatedCart) {
      if (preValue) {
        setTmpCartItemList(
          tmpCartItemList.map(e =>
            (e.cart._id === nextValue.cart._id && (nextValue.cart.weight_option ? nextValue.cart.weight_option === e.cart.weight_option : true))
              ? nextValue
              : e,
          ),
        );
      } else {
        setTmpCartItemList([...tmpCartItemList, nextValue]);
      }
    }
    if (resultAddCart.haveError) {
      let newSelect = cloneDeep(selectItem.current);
      newSelect.focusInput = false;
      setSelectItem(newSelect);
      inputRef.current.querySelector('input')?.focus();
      forceUpdate();
    }

    return resultAddCart.updatedCart;
  };

  const processOptions = () => {
    if (textSearch) {
      return options.filter(prod => {
        if (/^\!([\d-]*)$/.exec(textSearch)) {
          const itemNumber = textSearch.substring(1);
          return itemNumber ? prod.item_number.includes(itemNumber) : true;
        }

        if (/^\#(\d*)/.exec(textSearch)) {
          const _id = parseInt(textSearch.substring(1));
          return _id ? prod._id === _id : true;
        }

        return prod.name.toLowerCase().trim().match(new RegExp(textSearch.toLowerCase().trim(), 'g'));
      });
    }
    return options;
  };

  const openDialogChild = (options) => {
    setStateDialog({
      open: true,
      ...options
    });
  }

  const closeDialogChild = () => {
    setStateDialog({
      open: false,
    })
  }

  return (
    <>
      <DialogContent>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <TextField
            ref={inputRef}
            style={{ width: 350, whiteSpace: 'nowrap' }}
            autoFocus
            label="Søg produkt"
            placeholder={PLACEHOLDER_PRODUCT}
            value={textSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: loading ? <CircularProgress size={15} /> : noOption.current && <div style={{ color: 'red' }}>ikke fundet</div>,
            }}
            onChange={event => {
              if (selectItem.current.focusInput || selectItem.current.index) {
                let newSelect = cloneDeep(selectItem.current);
                newSelect.focusInput = false;
                newSelect.index = 0
                setSelectItem(newSelect);
                forceUpdate();
              }
              setTextSearch(event.target.value);
            }}
            onKeyDown={e => {
              if (['Enter'].includes(e.code)) {
                e.preventDefault();
              }
            }}
          />
        </div>
        <div style={{ display: 'flex', minHeight: '500px', height: '500px', margin: '10px 0px', minWidth: '470px' }}>
          <div style={{ flex: 1 }}>
            <div ref={orderHistory} style={{ overflow: 'auto', height: 'calc(100% - 20px)', position: 'relative' }}>
              {processOptions().map((option, index) => (
                <ProductOption
                  ariaSelected={selectItem.current.focusInput && index === selectItem.current.index}
                  autoFocus={selectItem.current.focusInput && index === selectItem.current.index}
                  key={option._id}
                  option={option}
                  cartItemList={tmpCartItemList}
                  customer={customer}
                  onSelect={onSelectOption}
                  offerBadge
                  stateDialog={{
                    ...stateDialog,
                    openDialog: openDialogChild,
                    closeDialog: closeDialogChild,
                  }}
                  onAdd={(nextValue, preValue) => onChangeCart(nextValue, preValue)}
                />
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
      <Dialog
        onClose={() => closeDialogChild()}
        aria-labelledby="fuse-dialog-title"
        classes={{
          paper: 'rounded-8'
        }}
        {...stateDialog}
      />
    </>
  );
};

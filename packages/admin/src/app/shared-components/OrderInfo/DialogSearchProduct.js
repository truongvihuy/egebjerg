import { useCallback, useEffect, useRef, useState } from 'react';
import { TextField, InputAdornment, CircularProgress } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { SEARCH_DELAY_TIME, PLACEHOLDER_PRODUCT } from 'app/constants';
import axios from 'app/axios';
import DialogContent from '@material-ui/core/DialogContent';
import { ProductOption } from './ProductOption';
import { isFreeNameProduct } from 'app/helper/general.helper';
import { merge, cloneDeep } from 'lodash';
import useForceUpdate from '@fuse/hooks/useForceUpdate';

const initSelect = {
  tab: 'product_list',
  product_list: 0,
  product_purchased_list: 0,
  focusInput: false,
};

export const DialogSearchProduct = ({ cartItemList, customer, onSelect, closeDialog, onAdd }) => {
  const [forceUpdate] = useForceUpdate();
  const [tmpCartItemList, setTmpCartItemList] = useState(cartItemList);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState({});
  const optionsRef = useRef(options);
  const noOption = useRef(false);
  const timer = useRef(null);
  const selectItem = useRef(initSelect);
  const allProduct = useRef();
  const orderHistory = useRef();
  const inputRef = useRef();

  const setSelectItem = useCallback((newSelect = initSelect) => {
    const prelistOption = (selectItem.current.tab === 'product_list' ? allProduct.current : orderHistory.current).querySelectorAll('.item-option');
    const nextlistOption = (newSelect.tab === 'product_list' ? allProduct.current : orderHistory.current).querySelectorAll('.item-option');

    prelistOption[selectItem.current[selectItem.current.tab]]?.removeAttribute('aria-selected');
    nextlistOption[newSelect[newSelect.tab]]?.setAttribute('aria-selected', 'true');

    if (nextlistOption[newSelect[newSelect.tab]]) {
      const node = nextlistOption[newSelect[newSelect.tab]];
      const nodeList = newSelect.tab === 'product_list' ? allProduct.current : orderHistory.current;

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
            indexSelect = newSelect[newSelect.tab] - 1;
            newSelect[newSelect.tab] = indexSelect > -1 ? indexSelect : optionsRef.current[newSelect.tab]?.length - 1;
            setSelectItem(newSelect);
            break;
          case 'ArrowDown':
            newSelect = cloneDeep(selectItem.current);
            indexSelect = newSelect[newSelect.tab] + 1;
            newSelect[newSelect.tab] = indexSelect < optionsRef.current[newSelect.tab]?.length ? indexSelect : 0;
            setSelectItem(newSelect);
            break;

          case 'ArrowLeft':
          case 'ArrowRight':
            newSelect = cloneDeep(selectItem.current);
            if (newSelect.tab === 'product_list') {
              newSelect.tab = 'product_purchased_list';
            } else {
              newSelect.tab = 'product_list';
            }
            setSelectItem(newSelect);
            break;

          case 'NumpadEnter':
          case 'Enter':
            newSelect = cloneDeep(selectItem.current);
            newSelect.focusInput = true;
            setSelectItem(newSelect);
            forceUpdate();
            // const listOption = (selectItem.current.tab === 'product_list' ? allProduct.current : orderHistory.current).querySelectorAll('.item-option');
            // listOption[selectItem.current[selectItem.current.tab]]?.click();
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
    return () => {
      document.removeEventListener('keydown', handleKeyArrow);
    };
  }, []);

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
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: loading ? <CircularProgress size={15} /> : noOption.current && <div style={{ color: 'red' }}>ikke fundet</div>,
            }}
            onChange={event => {
              noOption.current = false;
              if (selectItem.current.focusInput) {
                let newSelect = cloneDeep(selectItem.current);
                newSelect.focusInput = false;
                setSelectItem(newSelect);
                forceUpdate();
              }
              if (timer.current) {
                clearTimeout(timer.current);
                timer.current = null;
              }
              if (event.target.value.length > 2) {
                // if (!loading) {
                //   setLoading(true);
                // }
                timer.current = setTimeout(() => {
                  setLoading(true);
                  const params = { name: event.target.value, status: 'active', customer_id: customer._id };
                  axios
                    .get('/products', { params })
                    .then(({ data }) => {
                      setLoading(false);
                      noOption.current = data.data.product_list.length === 0;
                      setOptions(data.data);
                    })
                    .catch(e => {
                      setLoading(false);
                    });
                }, SEARCH_DELAY_TIME);
              } else {
                if (loading) {
                  setLoading(false);
                }
              }
            }}
            onKeyDown={e => {
              if (['Enter'].includes(e.code)) {
                e.preventDefault();
              }
            }}
          />
        </div>
        <div style={{ display: 'flex', minHeight: '500px', height: '500px', margin: '10px 0px' }}>
          <div style={{ flex: 1 }}>
            <h4 style={{ textAlign: 'center' }}>Ordre historik</h4>
            <div ref={orderHistory} style={{ overflow: 'auto', height: 'calc(100% - 20px)',position: 'relative' }}>
              {options.product_purchased_list?.map((option, index) => (
                <ProductOption
                  ariaSelected={selectItem.current.focusInput && selectItem.current.tab === 'product_purchased_list' && index === selectItem.current.product_purchased_list}
                  autoFocus={selectItem.current.focusInput && selectItem.current.tab === 'product_purchased_list' && index === selectItem.current.product_purchased_list}
                  key={option._id}
                  option={option}
                  cartItemList={tmpCartItemList}
                  customer={customer}
                  onSelect={onSelectOption}
                  onAdd={(nextValue, preValue) => onChangeCart(nextValue, preValue, 'product_purchased_list', index)}
                />
              ))}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <h4 style={{ textAlign: 'center' }}>Alt produkt</h4>
            <div ref={allProduct} style={{ overflow: 'auto', height: 'calc(100% - 20px)', position: 'relative' }}>
              {options.product_list?.map((option, index) => (
                <ProductOption
                  ariaSelected={selectItem.current.focusInput && selectItem.current.tab === 'product_list' && index === selectItem.current.product_list}
                  autoFocus={selectItem.current.focusInput && selectItem.current.tab === 'product_list' && index === selectItem.current.product_list}
                  key={option._id}
                  option={option}
                  cartItemList={tmpCartItemList}
                  customer={customer}
                  onSelect={onSelectOption}
                  onAdd={(nextValue, preValue) => onChangeCart(nextValue, preValue, 'product_list', index)}
                />
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </>
  );
};

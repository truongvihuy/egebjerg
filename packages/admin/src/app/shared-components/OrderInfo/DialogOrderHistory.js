import { useEffect, useRef, useState, useCallback } from 'react';
import { Icon, IconButton, TextField, InputAdornment } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { ORDER_STATUS_CONFIG, PLACEHOLDER_PRODUCT } from 'app/constants';
import axios from 'app/axios';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import { formatCurrency, isFreeNameProduct, convertUnixTime } from 'app/helper/general.helper';
import { ProductOption } from '.';
import { checkProductStock } from 'app/helper/order.helper';
import LoadingPanel from 'app/kendo/LoadingPanel';
import { cloneDeep } from 'lodash';

const ORDER_LIST_TAB = 'orderList';
const PRODUCT_LIST_TAB = 'productList';

const initSelectOrderHistory = {
  tab: ORDER_LIST_TAB,
  orderListIndex: 0,
  productListIndex: 0,
  autoFocus: false,
};

export const DialogOrderHistory = ({ cartItemList, customer, onAdd, onUpdateCartItemList, closeDialog }) => {
  const [orderList, setOrderList] = useState(null);
  const [productListOfOrder, setProductListOfOrder] = useState(null);
  const [tmpCartItemList, setTmpCartItemList] = useState(cartItemList);
  const [dataState, setDataState] = useState({ page: 1, take: 5 });
  const totalPage = useRef(null);
  const [textSearch, setTextSearch] = useState('');
  const [selectItem, setSelectItem] = useState(initSelectOrderHistory);
  const productOptionRef = useRef();
  const [loading, setLoading] = useState(false);
  const inputSearchRef = useRef();

  const handleScroll = useCallback((newSelect = initSelectOrderHistory) => {
    const listOption = productOptionRef.current.querySelectorAll('.item-option');;

    if (listOption[newSelect.productListIndex]) {
      const node = listOption[newSelect.productListIndex];
      const nodeList = productOptionRef.current;

      if (node.offsetTop < nodeList.scrollTop) {
        nodeList.scrollTop = node.offsetTop;
      }

      if (nodeList.scrollTop + nodeList.offsetHeight < node.offsetTop + node.offsetHeight) {
        nodeList.scrollTop = node.offsetTop + node.offsetHeight - nodeList.offsetHeight;
      }
    }

  }, []);

  useEffect(() => {
    const handleKeyArrow = e => {
      if (e.code === 'F3') {
        inputSearchRef.current.querySelector('input')?.focus();
        setSelectItem({ ...selectItem, autoFocus: false });
        e.preventDefault();
        return;
      }
      if (!selectItem.autoFocus) {
        let indexName = selectItem.tab + 'Index';
        let newSelect;
        let indexSelect;

        switch (e.code) {
          case 'ArrowUp':
            newSelect = { ...selectItem };
            indexSelect = newSelect[indexName] - 1;
            newSelect[indexName] = indexSelect > -1 ? indexSelect : (newSelect.tab === ORDER_LIST_TAB ? orderList : processData())?.length - 1;
            if (newSelect.tab === ORDER_LIST_TAB) {
              handleChangeOrderSelect(null, newSelect.orderListIndex);
            } else {
              setSelectItem(newSelect);
              handleScroll(newSelect);
            }

            break;

          case 'ArrowDown':
            newSelect = { ...selectItem };
            indexSelect = newSelect[indexName] + 1;
            newSelect[indexName] = indexSelect < (newSelect.tab === ORDER_LIST_TAB ? orderList : processData())?.length ? indexSelect : 0;
            if (newSelect.tab === ORDER_LIST_TAB) {
              handleChangeOrderSelect(null, newSelect.orderListIndex);
            } else {
              setSelectItem(newSelect);
              handleScroll(newSelect);
            }

            break;

          case 'ArrowLeft':
          case 'ArrowRight':
            newSelect = { ...selectItem };
            if (newSelect.tab === ORDER_LIST_TAB) {
              newSelect.tab = PRODUCT_LIST_TAB;
            } else {
              newSelect.tab = ORDER_LIST_TAB;
            }
            setSelectItem(newSelect);
            break;

          case 'NumpadEnter':
          case 'Enter':
            e.preventDefault();
            if (selectItem.tab !== ORDER_LIST_TAB) {
              if (productOptionRef.current.querySelector('.item-option[aria-selected=true]:not(.disabled)')) {
                // check stock in html
                setSelectItem({ ...selectItem, autoFocus: true });
              }
            }
            break;

          case 'Escape':
            closeDialog();
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
  }, [selectItem, setSelectItem, orderList]);

  useEffect(() => {
    let params = {
      customer_id: customer._id,
      page: dataState.page,
      limit: dataState.take,
    };
    axios
      .get('/orders', { params })
      .then(response => {
        let orders = response.data.data.order_list;
        setOrderList(orders);
        totalPage.current = (response.data.data.total / dataState.take) | (0 + 1);
        handleChangeOrderSelect(orders[0], 0);
      })
      .catch(e => { });
  }, [dataState]);

  const handleChangeOrderSelect = (order, index) => {
    setTextSearch('');
    let params = {
      id_list: [],
      status: 'active',
    };
    (order ?? orderList[index])?.product_list?.forEach(e => {
      if (e._id) {
        params.id_list.push(e._id);
      }
    });
    if (params.id_list.length > 0) {
      params.id_list = params.id_list.join(',');
      setLoading(true);
      axios
        .get('/products', { params })
        .then(response => {
          setLoading(false);
          setSelectItem({ ...initSelectOrderHistory, orderListIndex: index });
          setProductListOfOrder(response.data.data.product_list);
        })
        .catch(e => {
          setLoading(false);
          setSelectItem({ ...initSelectOrderHistory, orderListIndex: index });
        });
    } else {
      setSelectItem({ ...initSelectOrderHistory, orderListIndex: index });
    }
  };

  const onChangeCart = (nextValue, preValue) => {
    const resultAddCart = onAdd(nextValue, preValue, false);
    if (resultAddCart.updatedCart) {
      if (preValue) {
        setTmpCartItemList(
          tmpCartItemList.map(e =>
            (
              isFreeNameProduct(e.cart._id)
                ? e.cart.name === nextValue.cart.name && e.cart._id === nextValue.cart._id
                : e.cart._id === nextValue.cart._id && (nextValue.cart.weight_option ? nextValue.cart.weight_option === e.cart.weight_option : true)
            )
              ? nextValue
              : e,
          ),
        );
      } else {
        setTmpCartItemList([...tmpCartItemList, nextValue]);
      }
    }
    return resultAddCart.updatedCart;
  };

  const onChangePage = increase => {
    setDataState({
      ...dataState,
      page: dataState.page + increase,
    });
  };

  const addAllIntoCart = () => {
    const selectedOrder = orderList?.[selectItem.orderListIndex];
    if (selectedOrder?.product_list?.length) {
      let associatedIDList =
        productListOfOrder?.reduce((array, product) => {
          return array.concat(product.associated_list?.filter(e => e.amount).map(e => e._id) ?? []);
        }, []) ?? [];

      const handleAddCartList = (associatedListAll = []) => {
        const newCartItemList = cloneDeep(tmpCartItemList);
        selectedOrder.product_list.forEach(item => {
          let product = item._id && !item.associated_item_id ? productListOfOrder?.find(e => item._id === e._id) ?? null : null;
          if (product && checkProductStock(product, customer)) {
            const existingCartItemIndex = newCartItemList.findIndex(e =>
              isFreeNameProduct(product._id)
                ? e.cart.name === item.name && e.cart._id === item._id
                : product._id === e.cart._id && (item.weight_option ? item.weight_option === e.cart.weight_option : true),
            );

            if (existingCartItemIndex > -1) {
              newCartItemList[existingCartItemIndex].cart.quantity += item.quantity;
            } else {
              newCartItemList.forEach(e => {
                e.cart.position++;
              });
              let associatedList = null;
              const sameItem = newCartItemList.find(e => e.cart._id === item._id);
              if (sameItem) {
                associatedList = sameItem.associated_list;
              } else {
                associatedList = product.associated_list
                  ? associatedListAll.filter(p =>
                    product.associated_list.find(e => {
                      if (e._id === p._id && e.amount) {
                        p.amount = e.amount;
                        return true;
                      }
                    }),
                  )
                  : null;
              }

              let cart = {
                _id: item._id,
                position: 1,
                note: sameItem?.note,
                quantity: item.quantity,
                weight_option: item.weight_option,
              };
              if (isFreeNameProduct(item._id)) {
                cart.note = null;
                cart.name = item.name;
              }
              newCartItemList.push({
                product,
                cart,
                associated_list: associatedList,
              });
            }
          }
        });

        let result = onUpdateCartItemList(newCartItemList);
        if (result.updatedCart) {
          setTmpCartItemList(newCartItemList);
        }
      };

      if (associatedIDList.length) {
        let params = {
          id_list: associatedIDList.join(','),
          status: 'active',
        };

        axios.get(`/products`, { params }).then(response => {
          handleAddCartList(response.data.data.product_list);
        });
      } else {
        handleAddCartList();
      }
    }
  };

  const processData = () => {
    if (orderList?.[selectItem.orderListIndex]?.product_list) {
      return orderList?.[selectItem.orderListIndex]?.product_list.filter(prod => {
        if (prod._id && !prod.associated_item_id) {
          if (/^\!([\d-]*)$/.exec(textSearch)) {
            const itemNumber = textSearch.substring(1);
            return itemNumber ? prod.item_number.includes(itemNumber) : true;
          }

          if (/^\#(\d*)/.exec(textSearch)) {
            const _id = parseInt(textSearch.substring(1));
            return _id ? prod._id === _id : true;
          }

          return prod.name.toLowerCase().trim().match(new RegExp(textSearch.toLowerCase().trim(), 'g'));
        }
      });
    }
    return [];
  };

  return (
    <DialogContent>
      <div style={{ display: 'flex', minHeight: '500px', height: '500px', margin: '10px 0px' }}>
        <div style={{ flex: '0 0 280px' }}>
          <h4 style={{ textAlign: 'center' }}>Ordre historik</h4>
          <div style={{ overflow: 'auto', height: 'calc(100% - 50px)' }}>
            {orderList?.map((order, index) => (
              <div
                key={index}
                className="item-option"
                onClick={() => handleChangeOrderSelect(order, index)}
                aria-selected={selectItem.orderListIndex === index}
                data-type="order">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  Ordrenr: {order._id}{' '}
                  <span
                    style={{
                      border: '1px solid',
                      padding: '4px',
                      borderRadius: '4px',
                      color: ORDER_STATUS_CONFIG[order.status]?.color,
                    }}>
                    {ORDER_STATUS_CONFIG[order.status]?.name}
                  </span>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    Ordredato: <span>{convertUnixTime(order.created_date)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    Samlet pris: <span>{formatCurrency(order.amount)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex' }}>
            <IconButton color="primary" disabled={dataState.page === 1} style={{ flexGrow: 1 }} onClick={() => onChangePage(-1)}>
              <Icon fontSize="small">arrow_back_ios</Icon>
            </IconButton>
            <IconButton color="primary" disabled={dataState.page === totalPage.current} style={{ flexGrow: 1 }} onClick={() => onChangePage(1)}>
              <Icon fontSize="small">arrow_forward_ios</Icon>
            </IconButton>
          </div>
        </div>

        <div style={{ flex: 1, marginLeft: 20 }}>
          <TextField
            id="search-input"
            ref={inputSearchRef}
            style={{ width: 350, whiteSpace: 'nowrap' }}
            autoFocus={!selectItem.autoFocus}
            label="Søg produkt"
            placeholder={PLACEHOLDER_PRODUCT}
            value={textSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            onChange={event => {
              setSelectItem({ ...selectItem, productListIndex: 0 });
              setTextSearch(event.target.value);
            }}
          />
          <div
            ref={productOptionRef}
            id="order_product-list"
            style={{ overflow: 'auto', height: 'calc(100% - 80px)', position: 'relative', marginTop: 8 }}>
            {loading ? (
              <LoadingPanel />
            ) : (
              processData().map((item, index) => {
                let product = productListOfOrder?.find(e => item._id === e._id) ?? null;
                return (
                  <ProductOption
                    ariaSelected={selectItem.tab === PRODUCT_LIST_TAB && selectItem.productListIndex === index}
                    autoFocus={selectItem.autoFocus && selectItem.productListIndex === index && selectItem.tab === PRODUCT_LIST_TAB}
                    key={`${item._id}-${index}`}
                    cartItemList={tmpCartItemList}
                    option={product ?? item}
                    productInOrder={item}
                    onSelect={(_, autoFocus) =>
                      setSelectItem({ ...selectItem, tab: PRODUCT_LIST_TAB, productListIndex: index, autoFocus: autoFocus ?? selectItem.autoFocus })
                    }
                    disabled={!product}
                    customer={customer}
                    onAdd={onChangeCart}
                  />
                );
              })
            )}
          </div>
          <div className="flex justify-end">
            <Button color="primary" onClick={addAllIntoCart} disabled={!productListOfOrder?.length}>
              <Icon fontSize="small">add_shopping_cart</Icon>&nbsp; Læg hele ordren i kurv
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  );
};

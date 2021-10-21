import React, { useEffect, useReducer, useContext, createContext } from 'react';
import { reducer } from './cart.reducer';
import { initializeApollo } from 'utils/apollo'
import { UPDATE_CART, UPDATE_CART_MULTI, GET_CART, UPDATE_CART_NOTE } from 'graphql/query/cart.query';
import { CustomerContext } from 'contexts/customer/customer.context';
import { FirebaseContext } from 'contexts/firebase/firebase.context';
import { processOrderItemList } from '../../../../share/order.helper';
import { GET_PRODUCTS } from 'graphql/query/product.query';
import { isFreeNameProduct } from '../../../../share/general.helper';
import { cloneDeep } from 'lodash';
import { useIntl } from 'react-intl';


const CartContext = createContext({} as any);
const INITIAL_STATE = {
  isOpen: false,
  items: [],
  total: 0,
  error: null,
  note: null,
  order_id: null,
  isRestaurant: false,
  coupon: null,
  orderReceived: null,
};

const useCartActions = (initialCart = INITIAL_STATE) => {
  const { customerState } = useContext<any>(CustomerContext);
  const { firebaseDispatch } = useContext<any>(FirebaseContext);
  // const ref = firebaseClient.database().ref(`cart/${customerState._id}`);
  const apolloClient = initializeApollo();

  const [state, dispatch] = useReducer(reducer, initialCart);

  const intl = useIntl();

  const syncCartHandler = async (params) => {
    const {
      thisSessionId,
      newSnapshot,
      customerState,
      firstTime,
    } = params ?? ({} as any);

    const newSessionId = newSnapshot ? newSnapshot[0] : thisSessionId;
    if (!params || thisSessionId != newSessionId || state.items.length == 0) {
      let response = await apolloClient.query({
        query: GET_CART,
        fetchPolicy: 'no-cache',
        variables: {}
      });
      const cartItemList = response.data.getCart.product_list;
      const note = response.data.getCart.note;
      const order_id = response.data.getCart.order_id ?? null;

      const { total, error } = processOrderItemList(cartItemList, customerState);
      dispatch({ type: 'SYNC_CART', payload: { items: cartItemList ?? [], total, note, order_id, error }, intl });
    } else {
      // dispatch({ type: 'SYNC_CART', payload: { items: [], total: 0 } })
    }
  }

  const getCartItemToSend = (item, newItemList) => {
    let itemList = isFreeNameProduct(item._id)
      ? newItemList.filter(e => (e.cart._id === item._id) && (e.cart.position === item.position))
      : newItemList.filter(e => e.cart._id === item._id);
    let cartItemToSend: any = { _id: item._id };
    if (itemList.length > 1) {
      itemList.forEach(e => {
        cartItemToSend.note = e.cart.note;
        cartItemToSend.position = e.cart.position;
        if (!cartItemToSend.weight_option_list) {
          cartItemToSend.weight_option_list = [];
          cartItemToSend.quantity_list = [];
        }
        cartItemToSend.weight_option_list.push(e.cart.weight_option ?? null);
        cartItemToSend.quantity_list.push(e.cart.quantity);
      });
    } else {
      if (itemList.length) {
        if (isFreeNameProduct(item._id)) {
          cartItemToSend.name = itemList[0].cart.name;
          cartItemToSend.price = itemList[0].cart.price;
        }
        cartItemToSend.note = itemList[0].cart.note;
        cartItemToSend.position = itemList[0].cart.position;
        if (item.weight_option) {
          cartItemToSend.weight_option_list = [itemList[0].cart.weight_option];
          cartItemToSend.quantity_list = [itemList[0].cart.quantity];
        } else {
          cartItemToSend.quantity = itemList[0].cart.quantity;
        }
      } else {
        cartItemToSend.name = item.name;
        cartItemToSend.position = item.position;
        cartItemToSend.quantity = 0;
        cartItemToSend.price = item.price;
      }
    }

    return cartItemToSend;
  }

  const addItemToCart = async (cartList, item) => {
    const existingCartItemIndex = isFreeNameProduct(item._id)
      ? cartList.findIndex((itemCart) => (
        (itemCart.cart._id === item._id) &&
        (itemCart.cart.position === item.position)
      ))
      : cartList.findIndex((itemCart) => (
        (itemCart.cart._id === item._id) &&
        (item.weight_option ? itemCart.cart.weight_option === item.weight_option : true)
      ));

    let newItemList = cloneDeep(cartList);
    if (existingCartItemIndex > -1) {
      newItemList[existingCartItemIndex].cart.quantity += item.quantity;
    } else {
      newItemList.forEach(e => {
        e.cart.position++;
      });
      const sameItem = newItemList.find(e => e.cart._id === item._id);
      let associatedList = null;
      if (sameItem) {
        associatedList = sameItem.associated_list;
      } else {
        const idList = item.associated_list?.filter((e: any) => e.amount).map((e: any) => e._id);
        if (idList?.length) {
          const { data } = await apolloClient.query({
            query: GET_PRODUCTS,
            variables: {
              product_id: idList,
              limit: idList.length,
            },
          });
          associatedList = data?.products?.items;
        }
      }
      newItemList.push({
        product: sameItem?.product ?? item,
        cart: {
          _id: item._id,
          position: 1,
          note: isFreeNameProduct(item._id) ? null : sameItem?.note,
          quantity: item.quantity,
          weight_option: item.weight_option,
        },
        associated_list: associatedList,
      });
    };
    newItemList = newItemList.filter(e => e.cart.quantity > 0);

    return newItemList;
  };

  const addItemListToCart = async (cartList, items) => {
    let newItemList = cartList;
    for (const item of items) {
      newItemList = await addItemToCart(newItemList, { quantity: 1, ...item });
    }
    return newItemList;
  }

  useEffect(() => {
    if (customerState.isNormalAuthenticated) {
      //watch firebase
      firebaseDispatch({ type: 'REF_ON', payload: { route: `cart/${customerState._id}`, callback: syncCartHandler, sessionId: customerState.sessionId, customerState } })
    }
    return () => {
      firebaseDispatch({ type: 'REF_OFF', payload: { route: `cart/${customerState._id}` } });
    }
  }, [customerState.isNormalAuthenticated, customerState._id])

  const addItemHandler = async (item, quantity = 1) => {
    var newItemList = await addItemToCart(state.items, { ...item, quantity })
    var { total, error } = processOrderItemList(newItemList, customerState);
    //send to server
    await apolloClient.mutate(
      {
        mutation: UPDATE_CART,
        variables: getCartItemToSend(item, newItemList)
      }
    );
    dispatch({ type: 'ADD_ITEM', payload: { items: newItemList, total, error }, intl });
  };

  const removeItemHandler = async (item, quantity = 1) => {
    var newItemList = await addItemToCart(state.items, { ...item, quantity: -quantity });
    var { total, error } = processOrderItemList(newItemList, customerState);
    //send to server
    await apolloClient.mutate(
      {
        mutation: UPDATE_CART,
        variables: getCartItemToSend(item, newItemList),
      }
    );
    dispatch({ type: 'REMOVE_ITEM', payload: { items: newItemList, total, error }, intl });
  };

  const changeWeightOptionHandler = async (preItem, nextItem) => {
    var newItemList = await addItemToCart(state.items, nextItem);
    newItemList = await addItemToCart(newItemList, { ...preItem, quantity: -preItem.quantity });
    var { total, error } = processOrderItemList(newItemList, customerState);
    await apolloClient.mutate(
      {
        mutation: UPDATE_CART,
        variables: getCartItemToSend(preItem, newItemList),
      }
    );
    dispatch({ type: 'CHANGE_OPTION', payload: { items: newItemList, total, error }, intl });
  }

  const addItemListHandler = async (items) => {
    var newItemList = await addItemListToCart(state.items, items);
    var { total, error } = processOrderItemList(newItemList, customerState);
    await apolloClient.mutate(
      {
        mutation: UPDATE_CART_MULTI,
        variables: {
          product_list: newItemList.map(e => {
            delete e.cart.__typename;
            return e.cart;
          }),
        }
      }
    );
    dispatch({ type: 'ADD_ITEM_LIST', payload: { items: newItemList, total, error }, intl });
  };

  const noteItemHandler = async (item, note = null) => {
    var newState = { ...state, };
    newState.items = newState.items.map(e => {
      if (e.cart._id === item._id && (isFreeNameProduct(item._id) ? e.cart.position === item.position : true)) {
        e.cart.note = note;
      }
      return e;
    });
    await apolloClient.mutate(
      {
        mutation: UPDATE_CART,
        variables: getCartItemToSend(item, newState.items),
      }
    );
    dispatch({ type: 'NOTE_ITEM', payload: newState, intl });
  };

  const noteOrderHandler = async (note = null) => {
    await apolloClient.mutate(
      {
        mutation: UPDATE_CART_NOTE,
        variables: { note },
      }
    );
    dispatch({ type: 'NOTE_ORDER', payload: { note }, intl });
  }

  const clearCartHandler = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const toggleCartHandler = async () => {
    let payload = {
      isOpen: !state.isOpen,
      items: state.items,
      note: state.note,
    };
    if (!state.isOpen) {
      let response = await apolloClient.query({
        query: GET_CART,
        fetchPolicy: 'no-cache',
        variables: {}
      });
      payload.items = response.data.getCart.product_list;
      payload.note = response.data.getCart.note;
    }
    dispatch({ type: 'TOGGLE_CART', payload, intl });
  };
  const couponHandler = (coupon) => {
    dispatch({ type: 'APPLY_COUPON', payload: coupon });
  };
  const isInCartHandler = (id, weight_option) => {
    let itemList = state.items?.filter((item) => (item.cart._id === id));
    if (itemList.length) {
      if (weight_option) {
        return itemList.some(e => e.cart.weight_option === weight_option);
      } else {
        return true;
      }
    } else {
      return false;
    }
  };
  const getItemHandler = (id, weight_option) => {
    let itemList = state.items?.filter((item) => (item.cart._id === id));
    if (itemList.length) {
      if (weight_option) {
        return itemList.find(e => e.cart.weight_option === weight_option)?.cart ?? null;
      } else {
        return {
          _id: itemList[0].cart._id,
          quantity: itemList.reduce((total, item) => item.cart.quantity + total, 0),
          position: itemList[0].cart.position,
          note: itemList[0].cart.note,
        }
      }
    } else {
      return null;
    }
  };
  const pushOrderReceivedHandler = (payload) => {
    dispatch({ type: 'PUSH_ORDER_RECEIVED', payload });
  };
  // const getCartItemsPrice = () => cartItemsPrice(state.items).toFixed(2);
  // const getCartItemsTotalPrice = () =>
  //   cartItemsTotalPrice(state.items).toFixed(2);

  // const getDiscount = () => {
  //   const total = cartItemsTotalPrice(state.items);
  //   const discount = state.coupon
  //     ? (total * Number(state.coupon?.discountInPercent)) / 100
  //     : 0;
  //   return discount.toFixed(2);
  // };
  const getItemsCount = state.items?.reduce(
    (acc, item) => acc + item.cart.quantity,
    0
  );
  const cartItemsCount = state.items?.reduce(
    (acc, item) => acc + (item.associated_list?.length ?? 0) + 1,
    0
  );
  return {
    state,
    cartItemsCount,
    getItemsCount,
    addItemHandler,
    addItemListHandler,
    removeItemHandler,
    changeWeightOptionHandler,
    noteOrderHandler,
    clearCartHandler,
    isInCartHandler,
    getItemHandler,
    toggleCartHandler,
    syncCartHandler,
    // getCartItemsTotalPrice,
    // getCartItemsPrice,
    couponHandler,
    // getDiscount,
    noteItemHandler,
    pushOrderReceivedHandler,
  };
};

export const CartProvider = ({ children }) => {
  const {
    state,
    cartItemsCount,
    getItemsCount,
    addItemHandler,
    addItemListHandler,
    removeItemHandler,
    changeWeightOptionHandler,
    noteOrderHandler,
    clearCartHandler,
    isInCartHandler,
    getItemHandler,
    toggleCartHandler,
    syncCartHandler,
    // getCartItemsTotalPrice,
    couponHandler,
    // getDiscount,
    noteItemHandler,
    pushOrderReceivedHandler,
  } = useCartActions();

  return (
    <CartContext.Provider
      value={{
        isOpen: state.isOpen,
        items: state.items,
        note: state.note,
        order_id: state.order_id,
        totalPrice: state.total,
        cartItemsCount: cartItemsCount,
        itemsCount: getItemsCount,
        orderReceived: state.orderReceived,
        syncCart: syncCartHandler,
        addItem: addItemHandler,
        addItemList: addItemListHandler,
        removeItem: removeItemHandler,
        noteItem: noteItemHandler,
        noteOrder: noteOrderHandler,
        changeWeightOption: changeWeightOptionHandler,
        clearCart: clearCartHandler,
        isInCart: isInCartHandler,
        getItem: getItemHandler,
        toggleCart: toggleCartHandler,
        // calculatePrice: getCartItemsTotalPrice,
        applyCoupon: couponHandler,
        // calculateDiscount: getDiscount,
        pushOrderReceived: pushOrderReceivedHandler
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

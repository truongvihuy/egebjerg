import toast from 'react-hot-toast';

export const reducer = (state, action) => {
  switch (action.type) {
    case 'SYNC_CART':
    case 'TOGGLE_CART':
    case 'ADD_ITEM':
    case 'REMOVE_ITEM':
    case 'ADD_ITEM_LIST':
    case 'CHANGE_OPTION':
    case 'NOTE_ITEM':
    case 'NOTE_ORDER':
      if (action.payload.error && action.payload.error !== state.error && action.payload.error.startsWith('out_of_stock')) {
        toast.error(action.intl.formatMessage({
          id: 'productIsOutOfStock',
          defaultMessage: 'Some products are out of stock. Please check your cart again.',
        }));
      }
      return { ...state, ...action.payload };
    case 'CLEAR_CART':
      return { ...state, items: [], total: 0, note: null, error: null };
    case 'PUSH_ORDER_RECEIVED':
      return { ...state, items: [], total: 0, orderReceived: action.payload, error: null, };
    case 'APPLY_COUPON':
      return { ...state, coupon: action.payload };
    case 'REMOVE_COUPON':
      return { ...state, coupon: null };
    case 'TOGGLE_RESTAURANT':
      return { ...state, isRestaurant: !state.isRestaurant };
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
};

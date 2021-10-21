import axios from 'app/axios';
export * from './AdminComment';
export * from './CartItem';
export * from './CustomerInfo';
export * from './DialogSearchProduct';
export * from './DialogMostBought';
export * from './DialogAddSpecialProduct';
export * from './DialogOrderHistory';
export * from './MemberShipNumber';
export * from './NoteOrder';
export * from './OptionWeight';
export * from './OverweightRate';
export * from './PaymentMethod';
export * from './Price';
export * from './ProductCart';
export * from './ProductOption';
export * from './ReplacementGoods';
export * from './SearchProduct';
export * from './ShippingCode';
export * from './Store';

export const updateCustomer = (customer, data) => {
  axios.put(`/customers/${customer._id}`, data);
}
import {  Select, MenuItem, } from '@material-ui/core';
import { PAYMENT_METHOD, PAYMENT_METHOD_NO_PAYMENT } from 'app/constants';


export const PaymentMethod = ({ value, customer, onChange, disabled }) => {
  const store = customer?.store ?? null;
  const onChangeSelect = (e) => {
    const payment_method = e.target.value;

    if (customer) {
      updateCustomer(customer, { payment_method });
    }

    onChange(payment_method);
  };

  return (disabled || (store?.payment && store.payment[0] !== PAYMENT_METHOD_NO_PAYMENT)) && (
    <label>
      <div>Betalingsmetode</div>
      <Select value={value} style={{ width: 250 }} disabled={disabled} onChange={onChangeSelect}>
        {Object.values(PAYMENT_METHOD).map((e, i) => (
          <MenuItem key={i} value={e.value}>{e.shortLabel}</MenuItem>
        ))}
      </Select>
    </label>
  )
};
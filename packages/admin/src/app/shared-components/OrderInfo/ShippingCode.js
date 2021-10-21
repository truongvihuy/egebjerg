import { TextField } from '@material-ui/core';

export const ShippingCode = ({ onChange, value, disabled, error }) => (
  <label style={{ display: 'flex', alignItems: 'center' }}>
    <div>KØRENUMMER</div>
    <TextField error={!!error} style={{ marginLeft: '8px' }} value={value ?? ''} onChange={(e) => onChange(e.target.value, 'shipping_code')} disabled={disabled} />
    <div style={{ color: 'red' }} >{error}</div>
  </label>
);
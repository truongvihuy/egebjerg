import { CustomerInput } from 'app/kendo/CustomerInput';
import { CUSTOMER_TYPE_MAP } from 'app/constants';
import { ShippingCode } from './ShippingCode';

export const CustomerInfo = ({ dataItem, onChangeCustomer, value, disabled, onChange, error }) => {
  return (
    <div className='delivery-address'>
      {!disabled ? (
        <div style={{ width: '350px' }}>
          <CustomerInput autoFocus label='Kunde' className='suggest-search' onChange={onChangeCustomer} value={value} disableClearable customerType={CUSTOMER_TYPE_MAP.normal} isCreatingOrder={true} />
        </div>
      ) : (
        <h2>{dataItem.customer_name}</h2>
      )}
      <div>{dataItem.address_info?.address}</div>
      <div>{dataItem.address_info?.zip_code} {dataItem.address_info?.city}</div>
      {(disabled || !!value) && (
        <ShippingCode value={dataItem?.shipping_code ?? null} disabled={disabled} error={error?.shipping_code} onChange={onChange} />
      )}
    </div >
  );
};

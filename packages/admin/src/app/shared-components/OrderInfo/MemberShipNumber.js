import { useEffect, useRef, useState } from 'react';
import { Input } from '@material-ui/core';
import { updateCustomer } from '.';

export const MemberShipNumber = ({ value, customer, onChange, disabled }) => {
  const timer = useRef(null);
  const [membershipNumber, setMembershipNumber] = useState(value);

  useEffect(() => {
    setMembershipNumber(value);
  }, [value]);

  const onChangeInput = (e) => {
    setMembershipNumber(e.target.value);
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    timer.current = setTimeout(() => {
      const membership_number = e.target.value;

      if (customer) {
        updateCustomer(customer, { membership_number });
        customer.membership_number = membership_number;
      }
      timer.current = null;

      onChange(membership_number, 'membership_number');
    }, 300);
  };

  return (
    <label>
      <div style={{ marginTop: '8px' }}>Medlemskort stregkodenr.</div>
      <Input type='number' placeholder={'Medlemskort'} value={membershipNumber ?? ''} onChange={onChangeInput} disabled={disabled} />
    </label>
  )
};
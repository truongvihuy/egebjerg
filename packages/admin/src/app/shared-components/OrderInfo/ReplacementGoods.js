import { Switch } from '@material-ui/core';
import { updateCustomer } from '.';


export const ReplacementGoods = ({ value, customer, onChange, disabled }) => {
  const onChangeSwitch = disabled ? null : (e) => {
    const checked = e.target.checked, field = e.target.name;
    let newValue = (field === 'ordinary' && value) ? {
      ...value,
      milk_and_bread: true,
      [field]: checked,
    } : {
      ...value,
      [field]: checked,
    };
    if (customer) {
      updateCustomer(customer, { replacement_goods: newValue });
    }

    onChange(newValue);
  };

  return (
    <>
      <div>Ønsker du erstatningsvarer?</div>
      <div style={{ display: 'flex' }}>
        <div>
          <label>alm. varer <Switch color='primary' checked={!!value?.ordinary ?? false} name='ordinary' onChange={disabled ? null : onChangeSwitch} /></label>
        </div>
        {!value?.ordinary && (
          <div>
            <label>mælk og brød <Switch color='primary' checked={!!value?.milk_and_bread ?? false} name='milk_and_bread' onChange={disabled ? null : onChangeSwitch} /></label>
          </div>
        )}
        <div>
          <label>tilbudsvarer <Switch color='primary' checked={!!value?.promotion ?? false} name='promotion' onChange={disabled ? null : onChangeSwitch} /></label>
        </div>
      </div>
    </>
  )
};

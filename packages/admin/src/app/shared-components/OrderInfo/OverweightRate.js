import { useState } from 'react';
import { Icon, TextareaAutosize, } from '@material-ui/core';
import { InputQuantity } from 'app/kendo/OfferBadge';
import Button from '@material-ui/core/Button';

export const OverweightRate = ({ value, dataItem, onChange }) => {
  const [valueState, setValueState] = useState(value ?? { value: '', comment: '' });

  const onChangeQuantity = (e) => {
    setValueState({
      ...valueState,
      value: +e,
    });

    return {
      updatedCart: true,
      haveError: false,
    }
  };

  const onChangeComment = (e) => {
    setValueState({
      ...valueState,
      comment: e.target.value,
    });
  };

  const onClick = () => {
    onChange(valueState);
  };

  const onClickReset = () => {
    setValueState(value);
  }

  return dataItem.is_overweight && (
    <div className='delivery-address'>
      <div style={{ width: '300px' }}>
        <div>
          Overvægt
          <InputQuantity value={valueState.value ?? ''} onChange={onChangeQuantity} />
        </div>
        <TextareaAutosize style={{
          width: 'calc(100% - 8px)',
          margin: '4px',
          padding: '4px',
          resize: 'none',
          maxHeight: '28px',
          background: 'none',
          overflow: 'auto',
        }}
          minRows={1}
          value={valueState.comment ?? ''} onChange={onChangeComment} />
        <div>
          <Button onClick={onClickReset} color='secondary'>Annuller</Button>
          <Button color='primary' onClick={onClick}>
            <Icon fontSize='small'>save</Icon>&nbsp; Gem</Button>
        </div>
      </div>
    </div>
  );
}
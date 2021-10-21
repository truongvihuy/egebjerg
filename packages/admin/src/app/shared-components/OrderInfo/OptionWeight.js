import { useState } from 'react';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import { formatWeight, } from 'app/helper/general.helper';

export const OptionWeight = ({ onAdd, closeDialog, product }) => {
  const [option, setOption] = useState(null);

  const onSubmit = () => {
    onAdd(product, option);
    closeDialog();
  }
  const border = '1px solid #ccc';
  const borderSelect = '1px solid #1B9E85'

  return (
    <>
      <DialogTitle>{product.name}</DialogTitle>
      <DialogContent>
        <div style={{ display: 'flex' }}>
          {product.weight_list.map(weight => (
            <div style={{ cursor: 'pointer', padding: 4, border: option !== weight ? border : borderSelect, margin: '4px', }}
              onClick={() => setOption(weight)}>{formatWeight(weight)}</div>
          ))}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} color='secondary'>Annuller</Button>
        <Button disabled={!option} onClick={onSubmit} color='primary' focused autoFocus>OK</Button>
      </DialogActions>
    </>
  );
}
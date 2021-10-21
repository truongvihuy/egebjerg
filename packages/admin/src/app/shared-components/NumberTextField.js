import { forwardRef } from 'react';
import TextField from '@material-ui/core/TextField';

const NumberTextField = forwardRef((props, ref) => {
  return (
    <TextField
      {...props}
      ref={ref}
      type="number"
      onChange={e => {
        if (e.nativeEvent.constructor.name == 'InputEvent' && e.nativeEvent.inputType == 'insertText' && e.nativeEvent.data == '.') {
          return;
        }
        if (props.onChange) {
          props.onChange(e);
        }
      }}
    />
  );
});

export default NumberTextField;

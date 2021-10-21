import {  TextareaAutosize, } from '@material-ui/core';

export const NoteOrder = ({ value, onChange, disabled }) => {
  return (
    <label>
      <div>Bemærkning</div>
      <TextareaAutosize style={{
        width: 'calc(100% - 8px)',
        margin: '4px',
        padding: '4px',
        resize: 'none',
        maxHeight: '72px',
        background: 'none',
        overflow: 'auto',
      }}
        minRows={4} disabled={disabled}
        value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
};
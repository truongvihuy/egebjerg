import { TextareaAutosize } from '@material-ui/core';

export const AdminComment = ({ value }) => {
  return (
    <label>
      <TextareaAutosize style={{
        width: 'calc(100% - 8px)',
        padding: '4px',
        resize: 'none',
        maxHeight: '46px',
        background: 'none',
        overflow: 'auto',
      }}
        minRows={2} disabled
        value={value ?? ''} />
    </label>
  )
};
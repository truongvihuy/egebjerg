import Dialog from '@material-ui/core/Dialog';

function CustomDialog(props) {
  const options = props.options ?? {};
  const open = props.open ?? false;
  return (
    <Dialog
      open={open}
      onClose={e => { props.closeDialog() }}
      aria-labelledby="fuse-dialog-title"
      classes={{
        paper: 'rounded-8'
      }}
      {...options}
    />
  );
}

export default CustomDialog;

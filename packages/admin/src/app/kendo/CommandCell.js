import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import { connect } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';
import { openDialog, closeDialog } from 'app/store/fuse/dialogSlice';
import ConfirmDialog from 'app/shared-components/ConfirmDialog';

const CommandCell = props => {
  const { dataItem } = props;
  const isNewItem = dataItem._id === undefined;

  const confirmDelete = () => {
    props.openDialog({
      children: (
        <ConfirmDialog
          title={`${props.removeTitle ? props.removeTitle : `Slet element ${dataItem.name}?`}`}
          handleNo={() => props.closeDialog()}
          handleYes={() => {
            props.remove(dataItem);
            props.closeDialog();
          }}
        />
      )
    });
  };

  return (
    <>
      <IconButton
        type="button"
        title="Gem"
        className="k-grid-save-command"
        onClick={() => (isNewItem ? props.add(dataItem) : props.update(dataItem))}>
        <Icon color="primary">check</Icon>
      </IconButton>
      <IconButton
        type="button"
        title="Fortryd"
        className="k-grid-cancel-command"
        onClick={() => (isNewItem ? props.discard(dataItem) : props.cancel(dataItem))}>
        <Icon color="secondary">cancel</Icon>
      </IconButton>
      <IconButton type="button" className="k-grid-remove-command" onClick={confirmDelete} title="Slet" disabled={props.isEditing}>
        <Icon color="secondary">delete</Icon>
      </IconButton>
    </>
  );
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      openDialog,
      closeDialog
    },
    dispatch
  );
}

export default connect(null, mapDispatchToProps)(CommandCell);

import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import ConfirmDialog from 'app/shared-components/ConfirmDialog';

const CommandInForm = props => {
  const { dataItem } = props;
  const removePermision = dataItem._id && props?.pagePermission?.delete && props.remove;

  const confirmDelete = () => {
    props.openDialog({
      children: (
        <ConfirmDialog
          title={`${props.removeTitle ? props.removeTitle : `Vil du slette ${dataItem.name}?`}`}
          handleNo={() => props.closeDialog()}
          handleYes={() => {
            props.remove(dataItem);
          }}
        />
      ),
    });
  };

  return (
    <DialogActions className={removePermision ? 'justify-between' : null}>
      {removePermision ? (
        <IconButton type="button" className="k-grid-remove-command" onClick={confirmDelete} title="Slet" disabled={props.closeDialogisLoading}>
          <Icon color="secondary">delete</Icon>
        </IconButton>
      ) : null}
      <div className="flex justify-around">
        <Button onClick={props.closeDialog} disabled={props.isLoading} color="secondary">
          Annuller
        </Button>
        {props.secondButton && (
          <Button
            onClick={e => {
              props.secondButton.onClick();
            }}
            disabled={props.isLoading}
            color={props.secondButton.color}>
            {props.secondButton.label}
          </Button>
        )}
        {props.save ? (
          <Button
            onClick={props.save}
            disabled={props.isLoading}
            color="primary">
            Gem
          </Button>
        ) : (
          <Button type="submit" disabled={props.isLoading} color="primary">
            Gem
          </Button>
        )}
      </div>
    </DialogActions>
  );
};

export default CommandInForm;

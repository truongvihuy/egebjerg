import FusePageSimple from '@fuse/core/FusePageSimple';
import { makeStyles } from '@material-ui/core/styles';
import MailContent from './MailContent';

const useStyles = makeStyles({
  layoutRoot: {}
});

function Mail() {
  const classes = useStyles();

  return (
    <FusePageSimple
      classes={{
        root: classes.layoutRoot
      }}
      content={
        <div className="p-24">
          <MailContent />
        </div>
      }
    />
  );
}

export default Mail;

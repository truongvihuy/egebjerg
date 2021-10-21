import FusePageSimple from '@fuse/core/FusePageSimple';
import { makeStyles } from '@material-ui/core/styles';
import CustomerContent from './CustomerContent';
const useStyles = makeStyles({
  layoutRoot: {}
});

function Customer() {
  const classes = useStyles();
  return (
    <FusePageSimple
      classes={{
        root: classes.layoutRoot
      }}
      content={
        <div className="p-24">
          <CustomerContent />
        </div>}
    />
  );
}

export default Customer;

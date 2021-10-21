import FusePageSimple from '@fuse/core/FusePageSimple';
import { makeStyles } from '@material-ui/core/styles';
import OrderContent from './OrderContent';
const useStyles = makeStyles({
  layoutRoot: {}
});


function Order() {
  const classes = useStyles();

  return (
    <FusePageSimple
      classes={{
        root: classes.layoutRoot
      }}
      content={
        <div className="p-12">
          <OrderContent />
        </div>
      }
    />
  );
}

export default Order;

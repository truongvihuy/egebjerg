import FusePageSimple from '@fuse/core/FusePageSimple';
import { makeStyles } from '@material-ui/core/styles';
import OrderForm from './OrderForm';

const useStyles = makeStyles({
  layoutRoot: {}
});


function CreateOrder() {
  const classes = useStyles();

  return (
    <FusePageSimple
      classes={{
        root: classes.layoutRoot
      }}
      content={
        <div className="p-12">
          <OrderForm />
        </div>
      }
    />
  );
}

export default CreateOrder;

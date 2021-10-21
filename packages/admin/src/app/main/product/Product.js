import FusePageSimple from '@fuse/core/FusePageSimple';
import { makeStyles } from '@material-ui/core/styles';
import ProductContent from './ProductContent';
import { getParams } from '../../../@fuse/utils/index';
import { useEffect } from 'react';
const useStyles = makeStyles({
  layoutRoot: {}
});

function Product() {
  const classes = useStyles();
  const params = getParams();

  return (
    <FusePageSimple
      classes={{
        root: classes.layoutRoot
      }}
      content={
        <div className="p-24">
          <ProductContent />
        </div>
      }
    />
  );
}

export default Product;
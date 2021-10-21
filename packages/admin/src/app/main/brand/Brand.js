import FusePageSimple from '@fuse/core/FusePageSimple';
import { makeStyles } from '@material-ui/core/styles';
import BrandContent from './BrandContent';

const useStyles = makeStyles({
  layoutRoot: {}
});

function Brand() {
  const classes = useStyles();

  return (
    <FusePageSimple
      classes={{
        root: classes.layoutRoot
      }}
      content={
        <div className="p-24">
          <BrandContent />
        </div>
      }
    />
  );
}

export default Brand;

import FusePageSimple from '@fuse/core/FusePageSimple';
import { makeStyles } from '@material-ui/core/styles';
import ZipCodeContent from './ZipCodeContent';

const useStyles = makeStyles({
  layoutRoot: {}
});

function ZipCode() {
  const classes = useStyles();

  return (
    <FusePageSimple
      classes={{
        root: classes.layoutRoot
      }}
      content={
        <div className="p-24">
          <ZipCodeContent />
        </div>
      }
    />
  );
}

export default ZipCode;

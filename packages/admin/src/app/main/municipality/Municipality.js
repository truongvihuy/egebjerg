import FusePageSimple from '@fuse/core/FusePageSimple';
import { makeStyles } from '@material-ui/core/styles';
import MunicipalityContent from './MunicipalityContent';
const useStyles = makeStyles({
  layoutRoot: {}
});

function Municipality() {
  const classes = useStyles();

  return (
    <FusePageSimple
      classes={{
        root: classes.layoutRoot
      }}
      content={
        <div className="p-24">
          <MunicipalityContent />
        </div>
      }
    />
  );
}

export default Municipality;

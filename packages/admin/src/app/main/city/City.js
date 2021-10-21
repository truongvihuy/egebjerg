import FusePageSimple from '@fuse/core/FusePageSimple';
import { makeStyles } from '@material-ui/core/styles';
import CityContent from './CityContent';

const useStyles = makeStyles({
  layoutRoot: {}
});

function City() {
  const classes = useStyles();

  return (
    <FusePageSimple
      classes={{
        root: classes.layoutRoot
      }}
      content={
        <div className="p-24">
          <CityContent />
        </div>
      }
    />
  );
}

export default City;

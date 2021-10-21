import FusePageSimple from '@fuse/core/FusePageSimple';
import { makeStyles } from '@material-ui/core/styles';
import PBSContent from './PBSContent';

const useStyles = makeStyles({
  layoutRoot: {}
});

function PBS() {
  const classes = useStyles();

  return (
    <FusePageSimple
      classes={{
        root: classes.layoutRoot
      }}
      content={
        <div className="p-24">
          <PBSContent />
        </div>
      }
    />
  );
}

export default PBS;

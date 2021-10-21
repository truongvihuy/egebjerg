import FusePageSimple from '@fuse/core/FusePageSimple';
import { makeStyles } from '@material-ui/core/styles';
import TaskContent from './TaskContent';

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
          <TaskContent />
        </div>
      }
    />
  );
}

export default Brand;

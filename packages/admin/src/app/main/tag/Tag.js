import FusePageSimple from '@fuse/core/FusePageSimple';
import { makeStyles } from '@material-ui/core/styles';
import TagContent from './TagContent';

const useStyles = makeStyles({
  layoutRoot: {}
});

function Tag() {
  const classes = useStyles();

  return (
    <FusePageSimple
      classes={{
        root: classes.layoutRoot
      }}
      content={
        <div className="p-24">
          <TagContent />
        </div>
      }
    />
  );
}

export default Tag;

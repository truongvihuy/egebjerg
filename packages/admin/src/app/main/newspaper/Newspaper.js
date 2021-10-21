import FusePageSimple from '@fuse/core/FusePageSimple';
import { makeStyles } from '@material-ui/core/styles';
import NewspaperContent from './NewspaperContent';

const useStyles = makeStyles({
  layoutRoot: {}
});

function Newspaper() {
  const classes = useStyles();

  return (
    <FusePageSimple
      classes={{
        root: classes.layoutRoot
      }}
      content={
        <div className="p-12">
          <NewspaperContent />
        </div>
      }
    />
  );
}

export default Newspaper;
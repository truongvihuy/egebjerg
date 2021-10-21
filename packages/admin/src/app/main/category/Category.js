import FusePageSimple from '@fuse/core/FusePageSimple';
import { makeStyles } from '@material-ui/core/styles';
import CategoryContent from './CategoryContent';

const useStyles = makeStyles({
  layoutRoot: {}
});

function CategoryPage() {
  const classes = useStyles();

  return (
    <FusePageSimple
      classes={{
        root: classes.layoutRoot
      }}
      content={
        <div className="p-24">
          <CategoryContent />
        </div>
      }
    />
  );
}

export default CategoryPage;

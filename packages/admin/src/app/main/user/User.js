import FusePageSimple from '@fuse/core/FusePageSimple';
import { makeStyles } from '@material-ui/core/styles';
import UserContent from './UserContent';

const useStyles = makeStyles({
  layoutRoot: {}
});

function User() {
  const classes = useStyles();

  return (
    <FusePageSimple
      classes={{
        root: classes.layoutRoot
      }}
      content={
        <div className="p-24">
          <UserContent />
        </div>
      }
    />
  );
}

export default User;

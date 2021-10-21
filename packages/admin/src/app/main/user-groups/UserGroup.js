import FusePageSimple from '@fuse/core/FusePageSimple';
import { makeStyles } from '@material-ui/core/styles';
import UserGroupContent from './UserGroupContent';

const useStyles = makeStyles({
  layoutRoot: {}
});

function UserGroup() {
  const classes = useStyles();

  return (
    <FusePageSimple
      classes={{
        root: classes.layoutRoot
      }}
      content={
        <div className="p-24">
          <UserGroupContent />
        </div>
      }
    />
  );
}

export default UserGroup;

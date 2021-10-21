import DemoContent from '@fuse/core/DemoContent';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { makeStyles } from '@material-ui/core/styles';
import DashboardContent from './DashboardContent';

const useStyles = makeStyles({
  layoutRoot: {}
});

function Dashboard() {
  const classes = useStyles();

  return (
    <FusePageSimple
      classes={{
        root: classes.layoutRoot
      }}
      content={
        <div className="p-12">
          <DashboardContent />
        </div>
      }
    />
  );
}

export default Dashboard;

import FusePageSimple from '@fuse/core/FusePageSimple';
import { makeStyles } from '@material-ui/core/styles';
import ReportContent from './ReportContent';

const useStyles = makeStyles({
  layoutRoot: {}
});

function Report() {
  const classes = useStyles();

  return (
    <FusePageSimple
      classes={{
        root: classes.layoutRoot
      }}
      content={
        <div className="p-24">
          <ReportContent />
        </div>
      }
    />
  );
}

export default Report;

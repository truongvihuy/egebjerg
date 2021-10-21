import FusePageSimple from '@fuse/core/FusePageSimple';
import { makeStyles } from '@material-ui/core/styles';
import SettingContent from './SettingContent';

const useStyles = makeStyles({
  layoutRoot: {}
});

function Setting() {
  const classes = useStyles();

  return (
    <FusePageSimple
      classes={{
        root: classes.layoutRoot
      }}
      content={
        <div className="p-24">
          <SettingContent />
        </div>
      }
    />
  );
}

export default Setting;

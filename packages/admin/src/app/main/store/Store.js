import FusePageSimple from '@fuse/core/FusePageSimple';
import { makeStyles } from '@material-ui/core/styles';
import StoreContent from './StoreContent';
import StoreForm from './StoreForm';
const useStyles = makeStyles({
  layoutRoot: {}
});
export const getParams = () => {
  let result = {};
  let paramString = location.search;
  if (paramString.length > 0) {
    paramString = paramString.replace('?', '');
    let paramList = paramString.split('&');
    paramList.forEach(x => {
      const [key, value] = x.split('=');
      result[key] = value;
    });
  }
  return result;
};
function Store() {
  let params = getParams();
  const classes = useStyles();
  return (
    <FusePageSimple
      classes={{
        root: classes.layoutRoot
      }}
      content={params.editId ? <StoreForm editId={params.editId} /> : <StoreContent />}
    />
  );
}

export default Store;

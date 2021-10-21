export { default } from './FuseUtils';

export const getParams = () => {
  let result = {};
  let paramString = location.search;
  if (paramString.length > 0) {
    paramString = paramString.replace('?', '');
    let paramList = paramString.split('&');
    paramList.forEach(x => {
      const [key, value] = x.split('=');
      result[key] = value;
    })
  }
  return result;
}
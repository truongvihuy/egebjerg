import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_DOMAIN,
  // using withCredentials has issue: OPTIONS can pass but POST is failed
  // withCredentials: true
});
instance.CancelToken = axios.CancelToken;
instance.isCancel = axios.isCancel;

export default instance;

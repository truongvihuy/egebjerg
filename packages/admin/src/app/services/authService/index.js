import FuseUtils from '@fuse/utils/FuseUtils';
import axios from 'app/axios';
import jwtDecode from 'jwt-decode';
import { showSuccessMessage, showErrorMessage } from 'app/store/fuse/messageSlice';

class authService extends FuseUtils.EventEmitter {
  init() {
    this.setInterceptors();
    this.handleAuthentication();
  }

  setInterceptors = () => {
    axios.interceptors.response.use(
      response => {
        if (!!response.data.new_access_token) {
          axios.defaults.headers.common.Authorization = `Bearer ${response.data.new_access_token}`;
        }
        return response;
      },
      err => {
        if (/\/auth\/login/.exec(err.config.url)) {
          return null;
        }
        return new Promise((resolve, reject) => {
          if (err.response.status === 401 && err.config && !err.config.__isRetryRequest) {
            // if you ever get an unauthorized response, logout the user
            this.emit('onAutoLogout', 'Invalid access_token');
            this.setSession(null);
            throw err;
          }
          this.emit('onError', err.response?.data.message ?? 'Network error');
          throw err;
        });
      }
    );
  };

  handleAuthentication = () => {
    this.emit('onAutoLogin');
    // const access_token = this.getAccessToken();

    // if (!access_token) {
    // 	this.emit('onNoAccessToken');

    // 	return;
    // }

    // if (this.isAuthTokenValid(access_token)) {
    // 	// this.setSession(access_token);
    // 	const user = jwtDecode(access_token);
    // 	this.emit('onAutoLogin', {
    // 		...user,
    // 		accessToken: access_token
    // 	});
    // } else {
    // 	this.setSession(null);
    // this.emit('onRefreshToken', 'access_token expired');
    // }
  };

  createUser = data => {
    return new Promise((resolve, reject) => {
      axios.post('/api/auth/register', data).then(response => {
        if (response.data.user) {
          this.setSession(response.data.access_token);
          resolve(response.data.user);
        } else {
          reject(response.data.error);
        }
      });
    });
  };

  signInWithEmailAndPassword = (username, password) => {
    return new Promise((resolve, reject) => {
      axios
        .post(
          '/auth/login',
          {},
          {
            auth: {
              username,
              password
            }
          }
        )
        .then(response => {
          const { data } = response;
          if (data.access_token) {
            this.setSession(data.access_token);
            const user = jwtDecode(data.access_token);
            localStorage.setItem('isLogedIn', 1);
            if (user.setting?.paging) {
              localStorage.setItem('paging', JSON.stringify(user.setting.paging));
            }
            resolve(user);
          } else {
            reject(data.error);
          }
        })
        .catch(reject);
    });
  };

  signInWithRefeshToken = () => {
    return new Promise((resolve, reject) => {
      axios
        .post(
          '/auth/refresh-token',
          {},
        )
        .then(response => {
          const { data } = response;
          if (data.access_token) {
            const user = jwtDecode(data.access_token);
            this.setSession(data.access_token);
            resolve(user);
          } else {
            this.logout();
            reject(new Error('Failed to login with token.'));
            // reject(response.data.error);
          }
        })
        .catch(error => {
          reject(error);
          // this.logout();
          // reject(new Error('Auto login fail, please login'));
        });
    });
  };

  updateUserData = user => {
    return axios.post('/api/auth/user/update', {
      user
    });
  };

  setSession = access_token => {
    if (access_token) {
      axios.defaults.headers.common.Authorization = `Bearer ${access_token}`;
    } else {
      delete axios.defaults.headers.common.Authorization;
    }
  };

  logout = () => {
    axios.post('/auth/logout', {});
    this.setSession(null);
    localStorage.clear();
  };

  isAuthTokenValid = access_token => {
    if (!access_token) {
      return false;
    }
    const decoded = jwtDecode(access_token);
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      console.warn('access token expired');
      return false;
    }

    return true;
  };
}

const instance = new authService();

export default instance;

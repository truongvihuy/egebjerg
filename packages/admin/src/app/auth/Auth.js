import FuseSplashScreen from '@fuse/core/FuseSplashScreen';
import authService from 'app/services/authService';
import { Component } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';
import { hideMessage, showMessage, showErrorMessage } from 'app/store/fuse/messageSlice';

import { setUserData, logoutUser } from './store/userSlice';
import { setConfigCache } from 'app/store/fuse/cacheSlice';
import { loginSuccess } from './store/loginSlice';
import { MSG_AUTO_LOGIN_FAIL } from 'app/constants';
import axios from 'app/axios';
import config from 'config/config';
const firebaseClient = config.initFirebase();
let isUpdatingConfig = false;
export const setIsUpdatingConfig = value => {
  isUpdatingConfig = value;
};
class Auth extends Component {
  refCache = firebaseClient.database().ref('config');
  state = {
    waitAuthCheck: true,
  };

  componentDidMount() {
    return Promise.all([this.jwtCheck()]).then(() => {
      this.setState({ waitAuthCheck: false });
    });
  }

  getConfigAndSetLocalStorage = async lastConfigTime => {
    let configCache = (await axios.get(`/config`)).data.data;
    localStorage.setItem('configCache', JSON.stringify(configCache));
    localStorage.setItem('lastConfigTime', lastConfigTime);
    return configCache;
  };

  componentDidUpdate() {
    const logedIn = localStorage.getItem('isLogedIn');
    if (logedIn) {
      this.initCache();
    }
  }
  initCache() {
    this.refCache.off();
    this.refCache.on('value', async snapshot => {
      let configCache = null;

      if (!isUpdatingConfig) {
        let lastConfigTime = localStorage.getItem('lastConfigTime');
        if (snapshot.node_.value_ == lastConfigTime) {
          configCache = localStorage.getItem('configCache');
          if (configCache) {
            configCache = JSON.parse(configCache);
          } else {
            configCache = await this.getConfigAndSetLocalStorage(snapshot.node_.value_);
          }
        } else {
          configCache = await this.getConfigAndSetLocalStorage(snapshot.node_.value_);
        }
        this.props.setConfigCache(configCache);
      } else {
        isUpdatingConfig = false;
      }
    });
  }

  jwtCheck = () =>
    new Promise(resolve => {
      authService.on('onAutoLogin', () => {
        // this.props.showMessage({ message: 'Logging in with JWT' });

        /**
         * Sign in and retrieve user data from Api
         */
        const logedIn = localStorage.getItem('isLogedIn');
        if (logedIn) {
          authService
            .signInWithRefeshToken()
            .then(user => {
              this.props.setUserData(user);
              localStorage.setItem('isLogedIn', 1);

              resolve();

              // this.props.showMessage({ message: 'Logged in with JWT' });
            })
            .catch(error => {
              if (error?.response?.status === 401 || error?.response?.status === 403) {
                localStorage.removeItem('isLogedIn');
              }
              this.props.showMessage({ message: MSG_AUTO_LOGIN_FAIL });
              resolve();
            });
        } else {
          resolve();
        }
      });

      authService.on('onAutoLogout', message => {
        if (message) {
          this.props.showMessage({ message });
        }

        this.props.logout();

        resolve();
      });

      authService.on('onRefreshToken', message => {});

      authService.on('onError', message => {
        this.props.showErrorMessage(message);
      });

      authService.on('onNoAccessToken', () => {
        resolve();
      });
      authService.init();

      return Promise.resolve();
    });

  render() {
    return this.state.waitAuthCheck ? <FuseSplashScreen /> : <>{this.props.children}</>;
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      logout: logoutUser,
      setUserData,
      showErrorMessage,
      showMessage,
      hideMessage,
      loginSuccess,
      setConfigCache,
    },
    dispatch,
  );
}
function mapStateToProps(state) {
  return {
    user: state.auth.user,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Auth);

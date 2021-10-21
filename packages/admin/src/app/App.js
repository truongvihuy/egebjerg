import FuseAuthorization from '@fuse/core/FuseAuthorization';
import FuseLayout from '@fuse/core/FuseLayout';
import FuseTheme from '@fuse/core/FuseTheme';
import history from '@history';
import { createGenerateClassName, jssPreset, StylesProvider } from '@material-ui/core/styles';
import { create } from 'jss';
import jssExtend from 'jss-plugin-extend';
import rtl from 'jss-rtl';
import Provider from 'react-redux/es/components/Provider';
import { Router } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import AppContext from './AppContext';
import { Auth } from './auth';
import routes from './fuse-configs/routesConfig';
import store from './store';
import { DATETIME_PICKER_DEFAULT_PLACEHODLER } from 'app/constants';
import { DateTimePicker, DatePicker, DateRangePicker } from '@progress/kendo-react-dateinputs';

DateTimePicker.defaultProps = {
  ...DateTimePicker.defaultProps,
  format: 'dd/MM/yyyy HH:mm',
  formatPlaceholder: DATETIME_PICKER_DEFAULT_PLACEHODLER,
};

DatePicker.defaultProps = {
  ...DatePicker.defaultProps,
  format: 'dd/MM/yyyy',
  formatPlaceholder: DATETIME_PICKER_DEFAULT_PLACEHODLER,
};

DateRangePicker.defaultProps = {
  ...DateRangePicker.defaultProps,
  format: 'dd/MM/yyyy',
  formatPlaceholder: DATETIME_PICKER_DEFAULT_PLACEHODLER,
};

const jss = create({
  ...jssPreset(),
  plugins: [...jssPreset().plugins, jssExtend(), rtl()],
  insertionPoint: document.getElementById('jss-insertion-point'),
});

const generateClassName = createGenerateClassName({ disableGlobal: true });

const App = () => {
  return (
    <AppContext.Provider
      value={{
        routes,
      }}>
      <StylesProvider jss={jss} generateClassName={generateClassName}>
        <Provider store={store}>
          <Auth>
            <Router history={history}>
              <FuseAuthorization>
                <FuseTheme>
                  <SnackbarProvider
                    maxSnack={5}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    classes={{
                      containerRoot: 'bottom-0 right-0 mb-52 md:mb-68 mr-8 lg:mr-80 z-99',
                    }}>
                    <FuseLayout />
                  </SnackbarProvider>
                </FuseTheme>
              </FuseAuthorization>
            </Router>
          </Auth>
        </Provider>
      </StylesProvider>
    </AppContext.Provider>
  );
};

export default App;

import { Redirect } from 'react-router-dom';
import FuseUtils from '@fuse/utils';
import PublicPageConfig from 'app/main/public/PublicPageConfig';
import LoginConfig from 'app/main/login/LoginConfig';
import DashboardConfig from 'app/main/dashboard/DashboardConfig';
import OrderConfig from 'app/main/order/OrderConfig';
import CreateOrderConfig from '../main/create-order/CreateOrderConfig';
import ProductConfig from 'app/main/product/ProductConfig';
import CustomerConfig from 'app/main/customers/CustomerConfig';
import NewspaperConfig from 'app/main/newspaper/NewspaperConfig';
import OfferConfig from 'app/main/offer/OfferConfig';
import UserGroupConfig from 'app/main/user-groups/UserGroupConfig';
import UserConfig from 'app/main/user/UserConfig';
import CategoryConfig from 'app/main/category/CategoryConfig';
import MunicipalityConfig from 'app/main/municipality/MunicipalityConfig';
import CityConfig from 'app/main/city/CityConfig';
import ZipCodeConfig from 'app/main/zip-code/ZipCodeConfig';
import StoreConfig from 'app/main/store/StoreConfig';
import SettingConfig from 'app/main/setting/SettingConfig';
import BrandConfig from 'app/main/brand/BrandConfig';
import PBSConfig from 'app/main/pbs/PBSConfig';
import TagConfig from 'app/main/tag/TagConfig';
import TaskConfig from 'app/main/task/TaskConfig';
import ReportConfig from 'app/main/report/ReportConfig';

const routeConfigs = [
  LoginConfig,
  DashboardConfig,
  CreateOrderConfig,
  OrderConfig,
  ProductConfig,
  CustomerConfig,
  NewspaperConfig,
  OfferConfig,
  UserGroupConfig,
  UserConfig,
  CategoryConfig,
  MunicipalityConfig,
  CityConfig,
  ZipCodeConfig,
  PublicPageConfig,
  StoreConfig,
  SettingConfig,
  BrandConfig,
  PBSConfig,
  TagConfig,
  TaskConfig,
  ReportConfig,
];

const routes = [
  // if you want to make whole app auth protected by default change defaultAuth for example:
  // ...FuseUtils.generateRoutesFromConfigs(routeConfigs, ['admin','staff','user']),
  // The individual route configs which has auth option won't be overridden.
  ...FuseUtils.generateRoutesFromConfigs(routeConfigs),
  {
    path: '/',
    component: () => <Redirect to="/dashboard" />
  }
];

export default routes;

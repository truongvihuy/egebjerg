import Customer from './Customer';

const CustomerConfig = {
  settings: {
    layout: {
      config: {},
    },
  },
  routes: [
    {
      path: '/customer',
      component: Customer,
    },
  ],
};

export default CustomerConfig;

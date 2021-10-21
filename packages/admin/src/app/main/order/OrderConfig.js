import Order from './Order';

const OrderConfig = {
  settings: {
    layout: {
      config: {},
    },
  },
  routes: [
    {
      path: '/order',
      component: Order,
    },
  ],
};

export default OrderConfig;

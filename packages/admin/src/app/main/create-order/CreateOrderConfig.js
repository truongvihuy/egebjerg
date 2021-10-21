import CreateOrder from './CreateOrder';

const CreateOrderConfig = {
  settings: {
    layout: {
      config: {},
    },
  },
  routes: [
    {
      path: '/create-order',
      component: CreateOrder,
    },
  ],
};

export default CreateOrderConfig;

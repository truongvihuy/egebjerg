import Product from './Product';

const ProductConfig = {
  settings: {
    layout: {
      config: {},
    },
  },
  routes: [
    {
      path: '/product',
      component: Product,
    },
  ],
};

export default ProductConfig;

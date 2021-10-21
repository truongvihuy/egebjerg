import React from 'react';

const StoreConfig = {
  settings: {
    layout: {
      config: {}
    }
  },
  routes: [
    {
      path: '/store',
      component: React.lazy(() => import('./Store'))
    }
  ]
};

export default StoreConfig;
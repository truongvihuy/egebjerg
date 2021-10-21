import React from 'react';

const BrandConfig = {
  settings: {
    layout: {
      config: {}
    }
  },
  routes: [
    {
      path: '/brand',
      component: React.lazy(() => import('./Brand'))
    }
  ]
};

export default BrandConfig;
import React from 'react';

const CategoryConfig = {
  settings: {
    layout: {
      config: {},
    },
  },
  routes: [
    {
      path: '/category',
      component: React.lazy(() => import('./Category')),
    },
  ],
};

export default CategoryConfig;

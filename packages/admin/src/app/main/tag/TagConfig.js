import React from 'react';

const TagConfig = {
  settings: {
    layout: {
      config: {}
    }
  },
  routes: [
    {
      path: '/tag',
      component: React.lazy(() => import('./Tag'))
    }
  ]
};

export default TagConfig;
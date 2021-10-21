import React from 'react';

const PBSConfig = {
  settings: {
    layout: {
      config: {}
    }
  },
  routes: [
    {
      path: '/pbs',
      component: React.lazy(() => import('./PBS'))
    }
  ]
};

export default PBSConfig;
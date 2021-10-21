import React from 'react';

const MunicipalityConfig = {
  settings: {
    layout: {
      config: {}
    }
  },
  routes: [
    {
      path: '/municipality',
      component: React.lazy(() => import('./Municipality'))
    }
  ]
};

export default MunicipalityConfig;
import React from 'react';

const SettingConfig = {
  settings: {
    layout: {
      config: {}
    }
  },
  routes: [
    {
      path: '/setting',
      component: React.lazy(() => import('./Setting'))
    }
  ]
};

export default SettingConfig;
import React from 'react';

const ReportConfig = {
  settings: {
    layout: {
      config: {}
    }
  },
  routes: [
    {
      path: '/report',
      component: React.lazy(() => import('./Report'))
    }
  ]
};

export default ReportConfig;
import React from 'react';

const MailConfig = {
  settings: {
    layout: {
      config: {}
    }
  },
  routes: [
    {
      path: '/mail',
      component: React.lazy(() => import('./Mail'))
    }
  ]
};

export default MailConfig;
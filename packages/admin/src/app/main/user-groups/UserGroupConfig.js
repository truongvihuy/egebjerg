import React from 'react';

const UserGroupConfig = {
  settings: {
    layout: {
      config: {}
    }
  },
  routes: [
    {
      path: '/user-group',
      component: React.lazy(() => import('./UserGroup'))
    }
  ]
};

export default UserGroupConfig;

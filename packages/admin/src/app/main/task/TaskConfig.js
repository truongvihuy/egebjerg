import React from 'react';

const TaskConfig = {
  settings: {
    layout: {
      config: {}
    }
  },
  routes: [
    {
      path: '/task',
      component: React.lazy(() => import('./Task'))
    }
  ]
};

export default TaskConfig;
import React from 'react';

const UserConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    routes: [
        {
            path: '/user',
            component: React.lazy(() => import('./User'))
        }
    ]
};

export default UserConfig;
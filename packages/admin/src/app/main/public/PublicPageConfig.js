import React from 'react';

const ExampleConfig = {
	settings: {
		layout: {
			config: {}
		}
	},
	routes: [
		{
			path: '/default',
			component: React.lazy(() => import('./PublicPage'))
		}
	]
};

export default ExampleConfig;

/**
 * Lazy load Example
 */
/*
import React from 'react';

const ExampleConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    routes  : [
        {
            path     : '/default',
            component: React.lazy(() => import('./Example'))
        }
    ]
};

export default ExampleConfig;

*/

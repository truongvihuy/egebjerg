import React from 'react';

const ExampleConfig = {
	settings: {
		layout: {
			config: {}
		}
	},
	routes: [
		{
			path: '/dashboard',
            component: React.lazy(() => import('./Dashboard'))
		}
	]
};

export default ExampleConfig;

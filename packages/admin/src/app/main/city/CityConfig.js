import React from 'react';

const CityConfig = {
	settings: {
		layout: {
			config: {}
		}
	},
	routes: [
		{
			path: '/city',
			component: React.lazy(() => import('./City'))
		}
	]
};

export default CityConfig;
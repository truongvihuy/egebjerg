import React from 'react';

const ZipCodeConfig = {
	settings: {
		layout: {
			config: {}
		}
	},
	routes: [
		{
			path: '/zip-code',
      component: React.lazy(() => import('./ZipCode'))
		}
	]
};

export default ZipCodeConfig;
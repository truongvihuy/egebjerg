import React from 'react';

const OfferConfig = {
	settings: {
		layout: {
			config: {}
		}
	},
	routes: [
		{
			path: '/offer',
            component: React.lazy(() => import('./Offer'))
		}
	]
};

export default OfferConfig;
const settingsConfig = {
	layout: {
		style: 'layout1', // layout1 layout2 layout3
		config: {
            footer: {
                display: false,
                style: 'fixed'
            },
        } // checkout default layout configs at app/fuse-layouts for example  app/fuse-layouts/layout1/Layout1Config.js
	},
	customScrollbars: true,
	direction: 'ltr', // rtl, ltr
	theme: {
		main: 'light6',
		navbar: 'light6',
		toolbar: 'light6',
		footer: 'light6'
	}
};

export default settingsConfig;

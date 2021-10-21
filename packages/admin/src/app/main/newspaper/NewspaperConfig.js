import Newspaper from './Newspaper';

const NewspaperConfig = {
  settings: {
    layout: {
      config: {},
    },
  },
  routes: [
    {
      path: '/newspaper',
      component: Newspaper,
    },
  ],
};

export default NewspaperConfig;

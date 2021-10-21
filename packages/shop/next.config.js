const withPlugins = require('next-compose-plugins');
const withOptimizedImages = require('next-optimized-images');
const path = require('path');

// next.js configuration
const nextConfig = {
  // async redirects() {
  //   return [
  //     {
  //       source: '/',
  //       destination: '/grocery-two',
  //       permanent: true,
  //     },
  //   ];
  // },
  images: {
    domains: ['s3.amazonaws.com'],
  },
  webpack: (config) => {
    const pathShare = path.resolve(__dirname, '../share');
    config.resolve.modules.push(pathShare);
    config.module.rules[0].include.push(pathShare);
    return config;
  },
};

module.exports = withPlugins([withOptimizedImages], nextConfig);
// module.exports = {
//   images: {
//     sizes: [320, 480, 820, 1200, 1600],
//     domains: ['cdn11.bigcommerce.com'],
//   },
//   i18n: {
//     locales: ['en-US', 'es'],
//     defaultLocale: 'en-US',
//   },
//   rewrites() {
//     return [
//       {
//         source: '/:locale/checkout',
//         destination: '/api/bigcommerce/checkout',
//       },
//       {
//         source: '/checkout',
//         destination: '/api/bigcommerce/checkout',
//       },
//       // The logout is also an action so this route is not required, but it's also another way
//       // you can allow a logout!
//       {
//         source: '/:locale/logout',
//         destination: '/api/bigcommerce/customers/logout?redirect_to=/',
//       },
//       {
//         source: '/logout',
//         destination: '/api/bigcommerce/customers/logout?redirect_to=/',
//       },
//       // Rewrites for /search
//       {
//         source: '/:locale/search',
//         destination: '/search',
//       },
//       {
//         source: '/:locale/search/:path*',
//         destination: '/search',
//       },
//       {
//         source: '/search/designers/:name',
//         destination: '/search',
//       },
//       {
//         source: '/search/designers/:name/:category',
//         destination: '/search',
//       },
//       {
//         // This rewrite will also handle `/search/designers`
//         source: '/search/:category',
//         destination: '/search',
//       },
//     ]
//   },
// }

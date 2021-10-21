module.exports = function (api) {
  api.cache(true);

  const presets = ['next/babel'];
  const productionPlugins = [
    [
      'styled-components',
      {
        ssr: true,
      },
    ],
    'transform-remove-console',
  ];
  const devPlugins = [
    [
      'styled-components',
      {
        ssr: true,
      },
    ],
  ];

  return {
    presets,
    plugins:
      process.env.NODE_ENV === 'production' ? productionPlugins : devPlugins,
  };
};

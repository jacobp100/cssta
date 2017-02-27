module.exports = (config) => {
  const babelLoader = config.module.loaders.find(loader => loader.loader === 'babel');
  babelLoader.query.plugins = [
    ...(babelLoader.query.plugins || []),
    ['babel-plugin-cssta', {
      output: 'build/styles.css',
    }],
  ];
  return config;
};

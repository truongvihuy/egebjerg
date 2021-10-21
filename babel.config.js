module.exports = {
  babelrcRoots: ['.', 'packages/*'],
  plugins:
    process.env.NODE_ENV === 'production' ? ['transform-remove-console'] : [],
};

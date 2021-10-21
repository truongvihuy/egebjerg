let config = null;

const tryRequire = (path) => {
  try {
    return require(`${path}`);
  } catch (err) {
    return null;
  }
};
config = tryRequire('./config.server');
if (config == null) {
  config = tryRequire('./config.local');
}

export default config;
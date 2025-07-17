const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable ES Modules resolution to fix Supabase compatibility
config.resolver.unstable_enablePackageExports = false;

// Add resolver for Node.js polyfills
config.resolver.alias = {
  ...config.resolver.alias,
  stream: require.resolve('stream-browserify'),
  crypto: require.resolve('expo-crypto'),
  url: require.resolve('react-native-url-polyfill'),
};

// Configure transformer to handle Node.js modules
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;
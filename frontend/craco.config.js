const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Fix ajv issue
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "ajv/dist/compile/codegen": false
      };
      
      // Ignore ajv warnings
      webpackConfig.ignoreWarnings = [
        /Failed to parse source map/,
        /ajv/,
      ];
      
      return webpackConfig;
    },
  },
};
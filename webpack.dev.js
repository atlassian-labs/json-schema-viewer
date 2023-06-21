const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    historyApiFallback: true,
  },
  ignoreWarnings: [
    // Known issue with Atlaskit
    {
      module: /@atlaskit/,
      message: /Should not import the named export/,
    },
  ],
});

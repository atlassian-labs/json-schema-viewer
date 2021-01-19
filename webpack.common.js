const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const WebpackCdnPlugin = require('webpack-cdn-plugin');
const CspHtmlWebpackPlugin = require('csp-html-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  target: 'web',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    filename: 'bundle.[chunkhash].js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'JSON Schema Viewer',
      template: 'index.html',
      publicPath: '/',
      filename: 'index.html'
    }),
    new CspHtmlWebpackPlugin({
      'script-src': ["'strict-dynamic'"],
      'style-src': ["'unsafe-inline'", "'self'"]
    }),
    new webpack.DefinePlugin({
      'process': undefined,
      'process.release': null
    }),
    new webpack.EnvironmentPlugin({
      ANALYTICS_NEXT_MODERN_CONTEXT: true,
      NODE_ENV: 'development'
    }),
    /*new WebpackCdnPlugin({
      modules: [
        {
          name: '@atlaskit/css-reset',
          var: 'atlaskit-css-reset',
          style: 'dist/bundle.css',
          cssOnly: true
        }
      ],
      publicPath: '/node_modules'
    })*/
  ]
};
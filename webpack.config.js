const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const WebpackCdnPlugin = require('webpack-cdn-plugin');

module.exports = {
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  target: 'web',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: '(Development) JSON Schema Viewer',

    }),
    new webpack.DefinePlugin({
      'process': undefined,
      'process.release': null
    }),
    new webpack.EnvironmentPlugin({
      ANALYTICS_NEXT_MODERN_CONTEXT: true,
      NODE_ENV: 'development'
    }),
    new WebpackCdnPlugin({
      modules: [
        {
          name: '@atlaskit/css-reset',
          var: 'atlaskit-css-reset',
          style: 'dist/bundle.css',
          cssOnly: true
        }
      ],
      publicPath: '/node_modules'
    })
  ]
};
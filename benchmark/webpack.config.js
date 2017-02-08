const { join } = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './tests',
  output: {
    filename: 'tests-compiled.js',
    libraryTarget: 'commonjs',
  },
  resolve: {
    alias: {
      'react-native': join(__dirname, '/mocks/react-native'),
    },
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, use: ['babel-loader'] },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
    new webpack.optimize.UglifyJsPlugin(),
  ],
};

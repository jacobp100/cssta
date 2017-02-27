const path = require('path');

module.exports = [{
  entry: 'postcss',
  output: {
    path: path.join(__dirname, 'vendor'),
    filename: 'postcss.js',
    libraryTarget: 'commonjs2',
  },
  node: {
    fs: 'empty',
  },
}];

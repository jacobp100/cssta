const color = require('css-color-function');

const colorFnRe = /color\((?:[^()]+|\([^)]+\))+\)/g;

module.exports = value => value.replace(colorFnRe, color.convert);

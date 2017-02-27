'use strict';

var color = require('css-color-function');

var colorFnRe = /color\((?:[^()]+|\([^)]+\))+\)/g;

module.exports = function (value) {
  return value.replace(colorFnRe, color.convert);
};
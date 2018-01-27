// @flow
const color = require("css-color-function");

const colorFnRe = /color\((?:[^()]+|\([^)]+\))+\)/g;

module.exports = (value /*: string */) /*: string */ =>
  value.replace(colorFnRe, color.convert);

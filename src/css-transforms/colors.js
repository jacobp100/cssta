// @flow
/*
CAUTION!

This file could be included even after running the babel plugin.

Make sure you don't import large libraries.
*/
const color = require("css-color-function");

const colorFnRe = /color\((?:[^()]+|\([^)]+\))+\)/g;

module.exports = (value /*: string */) /*: string */ =>
  value.replace(colorFnRe, color.convert);

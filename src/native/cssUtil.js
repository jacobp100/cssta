// @flow
/*
CAUTION!

This file could be included even after running the babel plugin.

Make sure you don't import large libraries.
*/
const {
  default: cssToReactNative,
  transformRawValue
} = require("css-to-react-native");
const transformVariables = require("../css-transforms/variables");
const transformColors = require("../css-transforms/colors");
/*:: import type { StyleTuple, VariablesStore } from './types' */

module.exports.transformRawValue = transformRawValue;

module.exports.transformStyleTuples = (
  styleTuples /*: StyleTuple[] */,
  appliedVariables /*: ?VariablesStore */
) /*: Object */ => {
  const transformedStyleTuples = styleTuples.map(([property, value]) => {
    let transformedValue = value;
    if (appliedVariables != null) {
      transformedValue = transformVariables(transformedValue, appliedVariables);
    }
    transformedValue = transformColors(transformedValue);
    return [property, transformedValue];
  });
  return cssToReactNative(transformedStyleTuples);
};

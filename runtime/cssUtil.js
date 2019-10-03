// @flow
const {
  default: cssToReactNative,
  transformRawValue
} = require("css-to-react-native");
const transformVariables = require("./css-transforms/variables");
const transformColors = require("./css-transforms/colors");
// Viewport (hopefully) already transformed

/*::
import type { Variables } from "./VariablesContext";

export type StyleTuple = [string, string];
export type StyleTuples = StyleTuple[];
*/

module.exports.transformRawValue = transformRawValue;

module.exports.transformStyleTuples = (
  styleTuples /*: StyleTuples */,
  appliedVariables /*: ?Variables */
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

const { default: cssToReactNative, transformRawValue } = require('css-to-react-native');
const transformVariables = require('../css-transforms/variables');
const transformColors = require('../css-transforms/colors');

module.exports.transformRawValue = transformRawValue;

module.exports.transformStyleTuples = (styleTuples, appliedVariables) => {
  const transformedStyleTuples = styleTuples.map(([property, value]) => {
    let transformedValue = value;
    if (appliedVariables) transformedValue = transformVariables(transformedValue, appliedVariables);
    transformedValue = transformColors(transformedValue);
    return [property, transformedValue];
  });
  return cssToReactNative(transformedStyleTuples);
};

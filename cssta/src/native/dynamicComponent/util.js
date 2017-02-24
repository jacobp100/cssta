/* eslint-disable */
const { StyleSheet } = require('react-native');
/* eslint-enable */
/* eslint-disable no-param-reassign */
const cssToReactNative = require('css-to-react-native').default;
const transformVariables = require('../../css-transforms/variables');
const transformColors = require('../../css-transforms/colors');

/*
type Rule = {
  validate: Props => boolean,
  styleTuples: ([StyleProperty, string])[],
  exportedVariables: { [key:StyleVariableName]: string },
};
*/

/*
UntransformedStyles
  * Empty from variables manager
  * `rules` from any other config

TransformedStyles
  * Stylesheet from variables manager
  * Animated from transition manager
  * Also user styles
*/

module.exports.generateStylesheet = (appliedVariables, rules) => {
  const ruleStylesWithVariablesApplied = rules.map((rule) => {
    const styleTuples = rule.styleTuples.map(([property, value]) => {
      let transformedValue = value;
      transformedValue = transformVariables(transformedValue, appliedVariables);
      transformedValue = transformColors(transformedValue);
      return [property, transformedValue];
    });
    const style = cssToReactNative(styleTuples);
    return style;
  });

  const styleBody = ruleStylesWithVariablesApplied.reduce((accum, style, index) => {
    accum[index] = style;
    return accum;
  }, {});
  const styleSheet = StyleSheet.create(styleBody);

  const rulesWithVariablesApplied = rules.map((rule, index) => ({
    validate: rule.validate,
    style: styleSheet[index],
    transitions: rule.transitions,
  }));

  return rulesWithVariablesApplied;
};

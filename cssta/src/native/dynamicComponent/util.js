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

module.exports.createRuleStylesUsingStylesheet = (appliedVariables, untransformedRules) => {
  const styles = untransformedRules.map((rule) => {
    const styleTuples = rule.styleTuples.map(([property, value]) => {
      let transformedValue = value;
      transformedValue = transformVariables(transformedValue, appliedVariables);
      transformedValue = transformColors(transformedValue);
      return [property, transformedValue];
    });
    return cssToReactNative(styleTuples);
  });

  const styleBody = styles.reduce((accum, style, index) => {
    accum[index] = style;
    return accum;
  }, {});
  const stylesheet = StyleSheet.create(styleBody);

  const rules = untransformedRules.map((rule, index) => (
    Object.assign({}, rule, { style: styles[index], styleSheetReference: stylesheet[index] })
  ));

  return rules;
};

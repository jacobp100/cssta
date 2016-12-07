/* eslint-disable import/no-extraneous-dependencies */
const { StyleSheet } = require('react-native');
/* eslint-enable */
/* eslint-disable no-param-reassign */
const cssToReactNative = require('css-to-react-native').default;
const dynamicComponentFactory = require('../factories/dynamicComponentFactory');
const resolveVariableDependencies = require('../util/resolveVariableDependencies');
const { varRegExp } = require('../util');

/*
type Rule = {
  validate: Props => boolean,
  styleTuples: ([StyleProperty, string])[],
  variables: { [key:StyleVariableName]: string },
};
*/

module.exports = dynamicComponentFactory((ownProps, variablesFromScope, rules) => {
  const definedVariables = Object.assign(
    rules
      .filter(rule => rule.validate(ownProps))
      .map(rule => rule.variables)
  );
  return resolveVariableDependencies(definedVariables, variablesFromScope);
}, (appliedVariables, rules) => {
  const ruleStylesWithVariablesApplied = rules.map((rule) => {
    const styleTuples = rule.styleTuples.map(([property, value]) => {
      const valueWithVariablesApplied = value.replace(varRegExp, (m, variableName, fallback) => (
        appliedVariables[variableName] || fallback
      ));
      return [property, valueWithVariablesApplied];
    });
    const style = cssToReactNative(styleTuples);
    return style;
  });

  const styleTuples = ruleStylesWithVariablesApplied.reduce((accum, style, index) => {
    accum[index] = style;
    return accum;
  }, {});

  const styleSheet = StyleSheet.create(styleTuples);

  const rulesWithVariablesApplied = rules.map((rule, index) => ({
    validate: rule.validate,
    style: styleSheet[index],
  }));

  return rulesWithVariablesApplied;
}, (ownProps, passedProps, rulesWithVariablesApplied) => {
  let style = rulesWithVariablesApplied
    .filter(rule => rule.validate(ownProps))
    .map(rule => rule.style);

  if ('style' in passedProps) style = style.concat(passedProps.style);
  if (style.length > 0) passedProps.style = style;

  return passedProps;
});

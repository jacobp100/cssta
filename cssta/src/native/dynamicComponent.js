/* eslint-disable */
const { StyleSheet } = require('react-native');
/* eslint-enable */
/* eslint-disable no-param-reassign */
const cssToReactNative = require('css-to-react-native').default;
const dynamicComponentFactory = require('../factories/dynamicComponentFactory');
const resolveVariableDependencies = require('../util/resolveVariableDependencies');
const VariablesProvider = require('./VariablesProvider');
const staticComponentTransform = require('./staticComponentTransform');
const transformVariables = require('../css-transforms/variables');
const transformColors = require('../css-transforms/colors');

/*
type Rule = {
  validate: Props => boolean,
  styleTuples: ([StyleProperty, string])[],
  exportedVariables: { [key:StyleVariableName]: string },
};
*/

const getExportedVariables = (ownProps, variablesFromScope, rules) => {
  const appliedRuleVariables = rules
    .filter(rule => rule.validate(ownProps))
    .map(rule => rule.exportedVariables);
  const definedVariables = Object.assign({}, ...appliedRuleVariables);
  return resolveVariableDependencies(definedVariables, variablesFromScope);
};

const generateStylesheet = (appliedVariables, rules) => {
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
  }));

  return rulesWithVariablesApplied;
};

module.exports = dynamicComponentFactory(
  VariablesProvider,
  getExportedVariables,
  generateStylesheet,
  staticComponentTransform
);

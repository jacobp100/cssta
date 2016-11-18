/* eslint-disable import/no-extraneous-dependencies */
const { StyleSheet } = require('react-native');
/* eslint-enable */
const extractRules = require('./extractRules');
const { createValidatorForSelector } = require('./selectorTransform');
const createComponent = require('./createComponent');

/* eslint-disable no-param-reassign */
module.exports = element => (cssTextFragments, ...substitutions) => {
  const cssText =
    cssTextFragments[0] +
    substitutions.map((value, index) => String(value) + cssTextFragments[index + 1]).join('');

  const { rules: baseRules, styleSheetBody, propTypes } = extractRules(cssText);

  const styleSheet = StyleSheet.create(styleSheetBody);

  const rules = baseRules.map(rule => ({
    validator: createValidatorForSelector(rule.selector),
    style: styleSheet[rule.styleName],
  }));

  return createComponent(element, propTypes, rules);
};

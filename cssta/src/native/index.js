const extractRules = require('./extractRules');
const { createValidatorForSelector } = require('./selectorTransform');
const dynamicComponent = require('./dynamicComponent');
const VariablesProvider = require('./VariablesProvider');

/* eslint-disable no-param-reassign */
module.exports = element => (cssTextFragments, ...substitutions) => {
  const cssText = typeof cssTextFragments === 'string'
    ? cssTextFragments
    : cssTextFragments[0] +
      substitutions.map((value, index) => String(value) + cssTextFragments[index + 1]).join('');

  const { rules: baseRules, propTypes, managerArgs } = extractRules(cssText);

  const rules = baseRules.map(rule => ({
    validate: createValidatorForSelector(rule.selector),
    styleTuples: rule.styleTuples,
    exportedVariables: rule.exportedVariables,
  }));

  return dynamicComponent(element, propTypes, managerArgs, rules);
};

module.exports.VariablesProvider = VariablesProvider;

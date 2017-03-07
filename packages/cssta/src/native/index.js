const extractRules = require('./extractRules');
const { createValidatorForSelector } = require('./selectorTransform');
const withEnhancers = require('./withEnhancers');
const VariablesProvider = require('./VariablesProvider');
const VariablesStyleSheetManager = require('./enhancers/VariablesStyleSheetManager');
const Transition = require('./enhancers/Transition');
const Animation = require('./enhancers/Animation');

const dynamicComponent = withEnhancers([VariablesStyleSheetManager, Transition, Animation]);

/* eslint-disable no-param-reassign */
module.exports = element => (cssTextFragments, ...substitutions) => {
  const cssText = typeof cssTextFragments === 'string'
    ? cssTextFragments
    : cssTextFragments[0] +
      substitutions.map((value, index) => String(value) + cssTextFragments[index + 1]).join('');

  const { rules: baseRules, propTypes, args: baseArgs } = extractRules(cssText);

  const rules = baseRules.map(rule => ({
    validate: createValidatorForSelector(rule.selector),
    styleTuples: rule.styleTuples,
    transitions: rule.transitions,
    animation: rule.animation,
    exportedVariables: rule.exportedVariables,
  }));

  const args = Object.assign({}, baseArgs, { rules });
  return dynamicComponent(element, propTypes, args);
};

module.exports.VariablesProvider = VariablesProvider;

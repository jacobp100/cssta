const extractRules = require('./extractRules');
const { createValidatorForSelector } = require('./selectorTransform');
const dynamicComponent = require('./dynamicComponent');
const VariablesProvider = require('./VariablesProvider');
const VariablesStyleSheetManager = require('./dynamicComponentEnhancers/VariablesStyleSheetManager');
const Transition = require('./dynamicComponentEnhancers/Transition');
const Animation = require('./dynamicComponentEnhancers/Animation');

const defaultEnhancers = [VariablesStyleSheetManager, Transition, Animation];

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
    transitions: rule.transitions,
    animation: rule.animation,
    exportedVariables: rule.exportedVariables,
  }));

  const args = Object.assign({}, managerArgs, { rules });
  return dynamicComponent(element, propTypes, defaultEnhancers, args);
};

module.exports.VariablesProvider = VariablesProvider;

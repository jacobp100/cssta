'use strict';

var extractRules = require('./extractRules');

var _require = require('./selectorTransform'),
    createValidatorForSelector = _require.createValidatorForSelector;

var dynamicComponent = require('./dynamicComponent');
var VariablesProvider = require('./VariablesProvider');
var VariablesStyleSheetManager = require('./dynamicComponentEnhancers/VariablesStyleSheetManager');
var Transition = require('./dynamicComponentEnhancers/Transition');
var Animation = require('./dynamicComponentEnhancers/Animation');

var defaultEnhancers = [VariablesStyleSheetManager, Transition, Animation];

/* eslint-disable no-param-reassign */
module.exports = function (element) {
  return function (cssTextFragments) {
    for (var _len = arguments.length, substitutions = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      substitutions[_key - 1] = arguments[_key];
    }

    var cssText = typeof cssTextFragments === 'string' ? cssTextFragments : cssTextFragments[0] + substitutions.map(function (value, index) {
      return String(value) + cssTextFragments[index + 1];
    }).join('');

    var _extractRules = extractRules(cssText),
        baseRules = _extractRules.rules,
        propTypes = _extractRules.propTypes,
        managerArgs = _extractRules.managerArgs;

    var rules = baseRules.map(function (rule) {
      return {
        validate: createValidatorForSelector(rule.selector),
        styleTuples: rule.styleTuples,
        transitions: rule.transitions,
        animation: rule.animation,
        exportedVariables: rule.exportedVariables
      };
    });

    var args = Object.assign({}, managerArgs, { rules: rules });
    return dynamicComponent(element, propTypes, defaultEnhancers, args);
  };
};

module.exports.VariablesProvider = VariablesProvider;
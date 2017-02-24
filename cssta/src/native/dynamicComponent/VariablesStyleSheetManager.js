/* eslint-disable no-param-reassign */
const React = require('react');
const { createRuleStylesUsingStylesheet } = require('./util');
const VariablesProvider = require('../VariablesProvider');
const resolveVariableDependencies = require('../../util/resolveVariableDependencies');

const { Component } = React;

const getExportedVariables = (ownProps, variablesFromScope, rules) => {
  const appliedRuleVariables = rules
    .filter(rule => rule.validate(ownProps))
    .map(rule => rule.exportedVariables);
  const definedVariables = Object.assign({}, ...appliedRuleVariables);
  return resolveVariableDependencies(definedVariables, variablesFromScope);
};

module.exports = class VariablesStyleSheetManager extends Component {
  constructor() {
    super();
    this.styleCache = {};
  }

  render() {
    const {
      NextElement, Element, ownProps, passedProps, rules: untransformedRules, managerArgs,
    } = this.props;
    const { importedVariables } = managerArgs;
    const { styleCache } = this;

    return React.createElement(
      VariablesProvider,
      {
        exportedVariables: variablesFromScope => (
          getExportedVariables(ownProps, variablesFromScope, untransformedRules)
        ),
      },
      (appliedVariables) => {
        const ownAppliedVariables = importedVariables.reduce((accum, key) => {
          accum[key] = appliedVariables[key];
          return accum;
        }, {});
        const styleCacheKey = JSON.stringify(ownAppliedVariables);
        const styleCached = styleCacheKey in styleCache;

        const rules = styleCached
          ? styleCache[styleCacheKey]
          : createRuleStylesUsingStylesheet(ownAppliedVariables, untransformedRules);

        if (!styleCached) styleCache[styleCacheKey] = rules;

        const nextProps = { Element, ownProps, passedProps, rules, managerArgs };
        return React.createElement(NextElement, nextProps);
      }
    );
  }
};

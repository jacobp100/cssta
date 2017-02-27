/* eslint-disable no-param-reassign */
const React = require('react');
const VariablesProvider = require('../VariablesProvider');
const { getAppliedRules } = require('../util');
const { createRuleStylesUsingStylesheet } = require('./util');
const resolveVariableDependencies = require('../../util/resolveVariableDependencies');

const { Component } = React;

const getExportedVariables = (ownProps, variablesFromScope, rules) => {
  const appliedRuleVariables = getAppliedRules(rules, ownProps)
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
    const { styleCache } = this;

    return React.createElement(
      VariablesProvider,
      {
        exportedVariables: variablesFromScope => (
          getExportedVariables(this.props.ownProps, variablesFromScope, this.props.args.rules)
        ),
      },
      (appliedVariables) => {
        const ownAppliedVariables = this.props.args.importedVariables.reduce((accum, key) => {
          accum[key] = appliedVariables[key];
          return accum;
        }, {});
        const styleCacheKey = JSON.stringify(ownAppliedVariables);
        const styleCached = styleCacheKey in styleCache;

        const rules = styleCached
          ? styleCache[styleCacheKey]
          : createRuleStylesUsingStylesheet(ownAppliedVariables, this.props.args.rules);

        if (!styleCached) styleCache[styleCacheKey] = rules;

        const { children } = this.props;
        const nextProps = this.props;
        nextProps.args.rules = rules;

        return React.cloneElement(children, nextProps);
      }
    );
  }
};

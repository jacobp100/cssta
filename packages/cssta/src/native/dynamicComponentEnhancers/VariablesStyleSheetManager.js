const React = require('react');
/* eslint-disable */
const { StyleSheet } = require('react-native');
/* eslint-enable */
const cssToReactNative = require('css-to-react-native').default;
const VariablesProvider = require('../VariablesProvider');
const transformVariables = require('../../css-transforms/variables');
const transformColors = require('../../css-transforms/colors');
const { getAppliedRules } = require('../util');
const resolveVariableDependencies = require('../../util/resolveVariableDependencies');

const { Component } = React;

/* eslint-disable no-param-reassign */
const getExportedVariables = (props, variablesFromScope) => {
  const appliedRuleVariables = getAppliedRules(props.args.rules, props.ownProps)
    .map(rule => rule.exportedVariables);
  const definedVariables = Object.assign({}, ...appliedRuleVariables);
  return resolveVariableDependencies(definedVariables, variablesFromScope);
};

const createRuleStylesUsingStylesheet = (appliedVariables, untransformedRules) => {
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

  const rules = untransformedRules.map((rule, index) =>
    Object.assign({}, rule, { style: styles[index], styleSheetReference: stylesheet[index] }));

  return rules;
};

module.exports = class VariablesStyleSheetManager extends Component {
  constructor() {
    super();
    this.styleCache = {};

    this.getExportedVariables = variablesFromScope =>
      getExportedVariables(this.props, variablesFromScope);
    this.renderWithVariables = this.renderWithVariables.bind(this);
  }

  renderWithVariables(appliedVariables) {
    const { styleCache } = this;

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

    const { args, children } = this.props;
    const nextArgs = Object.assign({}, args, { rules });
    const nextProps = Object.assign({}, this.props, { args: nextArgs });

    return children(nextProps);
  }

  render() {
    return React.createElement(
      VariablesProvider,
      { exportedVariables: this.getExportedVariables },
      this.renderWithVariables
    );
  }
};

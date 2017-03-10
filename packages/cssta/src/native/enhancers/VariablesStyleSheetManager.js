const React = require('react');
/* eslint-disable */
const { StyleSheet } = require('react-native');
/* eslint-enable */
const VariablesProvider = require('../VariablesProvider');
const { getAppliedRules } = require('../util');
const resolveVariableDependencies = require('../../util/resolveVariableDependencies');
const { transformStyleTuples } = require('../cssUtil');

const { Component } = React;

/* eslint-disable no-param-reassign */
const getExportedVariables = (props, variablesFromScope) => {
  const appliedRuleVariables = getAppliedRules(props.args.rules, props.ownProps)
    .map(rule => rule.exportedVariables);
  const definedVariables = Object.assign({}, ...appliedRuleVariables);
  return resolveVariableDependencies(definedVariables, variablesFromScope);
};

const createRuleStylesUsingStylesheet = (appliedVariables, args) => {
  const styles = args.rules
    .map(rule => transformStyleTuples(rule.styleTuples, appliedVariables));

  const styleBody = styles.reduce((accum, style, index) => {
    accum[index] = style;
    return accum;
  }, {});
  const stylesheet = StyleSheet.create(styleBody);

  const rules = args.rules
    .map((rule, index) => Object.assign({}, rule, { style: stylesheet[index] }));

  // FIXME: Transitions (i.e. `transition: color var(--short-duration) var(--easing)`)
  const { keyframesStyleTuples } = args;
  const keyframes = Object.keys(keyframesStyleTuples).reduce((accum, keyframeName) => {
    const keyframeStyles = keyframesStyleTuples[keyframeName].map(({ time, styleTuples }) => ({
      time,
      styles: transformStyleTuples(appliedVariables, styleTuples),
    }));
    accum[keyframeName] = keyframeStyles;
    return accum;
  }, {});

  return { rules, keyframes };
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

    const transformedArgs = styleCached
      ? styleCache[styleCacheKey]
      : createRuleStylesUsingStylesheet(ownAppliedVariables, this.props.args);

    if (!styleCached) styleCache[styleCacheKey] = transformedArgs;

    const { args, children } = this.props;
    const nextArgs = Object.assign({}, args, transformedArgs);
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

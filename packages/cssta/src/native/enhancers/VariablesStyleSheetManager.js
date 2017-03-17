const React = require('react');
/* eslint-disable */
const { StyleSheet } = require('react-native');
/* eslint-enable */
const VariablesProvider = require('../VariablesProvider');
const { getAppliedRules } = require('../util');
const resolveVariableDependencies = require('../../util/resolveVariableDependencies');
const { transformStyleTuples } = require('../cssUtil');
const transformVariables = require('../../css-transforms/variables');
const { mapValues } = require('../../util');

const { Component } = React;

/* eslint-disable no-param-reassign */
const getExportedVariables = (props, variablesFromScope) => {
  const appliedRuleVariables = getAppliedRules(props.args.ruleTuples, props.ownProps)
    .map(rule => rule.exportedVariables);
  const definedVariables = Object.assign({}, ...appliedRuleVariables);
  return resolveVariableDependencies(definedVariables, variablesFromScope);
};

const substitutePartsVariables = (appliedVariables, parts) =>
  parts.map(part => transformVariables(part, appliedVariables));

const createRuleStylesUsingStylesheet = (appliedVariables, args) => {
  const { keyframesStyleTuples, ruleTuples } = args;
  const styles = ruleTuples.map(rule => transformStyleTuples(rule.styleTuples, appliedVariables));

  const styleBody = styles.reduce((accum, style, index) => {
    accum[index] = style;
    return accum;
  }, {});
  const stylesheet = StyleSheet.create(styleBody);

  const rules = ruleTuples
    .map((rule, index) => Object.assign({}, rule, { style: stylesheet[index] }))
    .map((rule) => {
      const { transitionParts, animationParts } = rule;
      const transitions = transitionParts
        ? mapValues(
          parts => substitutePartsVariables(appliedVariables, parts),
          transitionParts)
        : null;
      const animation = animationParts
        ? substitutePartsVariables(appliedVariables, animationParts)
        : null;
      return Object.assign({}, rule, { transitions, animation });
    });

  const keyframes = Object.keys(keyframesStyleTuples).reduce((accum, keyframeName) => {
    const keyframeStyles = keyframesStyleTuples[keyframeName].map(({ time, styleTuples }) => ({
      time,
      styles: transformStyleTuples(styleTuples, appliedVariables),
    }));
    accum[keyframeName] = keyframeStyles;
    return accum;
  }, {});

  return { keyframes, rules };
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

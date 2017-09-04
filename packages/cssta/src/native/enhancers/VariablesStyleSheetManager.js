// @flow
const React = require('react');
/* eslint-disable */
// $FlowFixMe
const { StyleSheet } = require('react-native');
/* eslint-enable */
const VariablesProvider = require('../VariablesProvider');
const { getAppliedRules } = require('../util');
const resolveVariableDependencies = require('../../util/resolveVariableDependencies');
const { transformStyleTuples } = require('../cssUtil');
const transformVariables = require('../../css-transforms/variables');
const { mapValues } = require('../../util');
/*:: import type { DynamicProps } from '../../factories/types' */
/*::
import type {
  VariableArgs, VariableRuleTuple, Args, VariablesStore, Style, Rule, Keyframe,
} from '../types'
*/

const { Component } = React;

/* eslint-disable no-param-reassign */
const getExportedVariables = (props, variablesFromScope) => {
  const appliedRuleVariables = getAppliedRules(props.args.ruleTuples, props.ownProps)
    // $FlowFixMe
    .map(rule => rule.exportedVariables);
  const definedVariables = Object.assign({}, ...appliedRuleVariables);
  return resolveVariableDependencies(definedVariables, variablesFromScope);
};

const substitutePartsVariables = (appliedVariables, parts) =>
  parts.map(part => transformVariables(part, appliedVariables));

const createRule = (
  inputRule /*: VariableRuleTuple */,
  style /*: string */,
  appliedVariables /*: Object */
) /*: Rule */ => {
  const { validate, transitionParts, animationParts } = inputRule;
  const transitions = transitionParts
    ? mapValues(
      parts => substitutePartsVariables(appliedVariables, parts),
      transitionParts)
    : null;
  const animation = animationParts
    ? substitutePartsVariables(appliedVariables, animationParts)
    : null;

  return { validate, transitions, animation, style };
};

const createRuleStylesUsingStylesheet = (
  appliedVariables,
  args /*: VariableArgs */
) /*: Args */ => {
  const { transitionedProperties, keyframesStyleTuples, ruleTuples } = args;
  const styles /*: (Style | null)[] */ = ruleTuples.map(rule => (
    rule.styleTuples ? transformStyleTuples(rule.styleTuples, appliedVariables) : null
  ));

  const styleBody = styles.reduce((accum, style, index) => {
    if (style != null) accum[index] = style;
    return accum;
  }, {});
  const stylesheet = StyleSheet.create(styleBody);

  const rules = ruleTuples.map((rule, index) => (
    rule.styleTuples ? createRule(rule, stylesheet[index], appliedVariables) : rule
  ));

  const keyframes = Object.keys(keyframesStyleTuples).reduce((accum, keyframeName) => {
    const keyframeStyles /*: Keyframe[] */ = keyframesStyleTuples[keyframeName].map(keyframe => (
      keyframe.styleTuples
        ? {
          time: keyframe.time,
          styles: transformStyleTuples(keyframe.styleTuples, appliedVariables),
        }
        : keyframe
    ));
    accum[keyframeName] = keyframeStyles;
    return accum;
  }, {});

  return { transitionedProperties, keyframes, rules };
};

module.exports = class VariablesStyleSheetManager extends Component /*::<
  DynamicProps<VariableArgs>
>*/ {
  /*::
  styleCache: Object
  getExportedVariables: (variables: VariablesStore) => VariablesStore
  renderWithVariables: (variables: VariablesStore) => any
  */

  constructor() {
    super();
    this.styleCache = {};

    this.getExportedVariables = variablesFromScope =>
      getExportedVariables(this.props, variablesFromScope);
    this.renderWithVariables = this.renderWithVariables.bind(this);
  }

  renderWithVariables(appliedVariables /*: VariablesStore */) {
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

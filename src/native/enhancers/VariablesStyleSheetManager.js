// @flow
/*
CAUTION!

This file could be included even after running the babel plugin.

Make sure you don't import large libraries.
*/
const React = require("react");
/* eslint-disable */
// $FlowFixMe
const { StyleSheet } = require("react-native");
/* eslint-enable */
const VariablesProvider = require("../VariablesProvider");
const { getAppliedRules } = require("../util");
const resolveVariableDependencies = require("./resolveVariableDependencies");
const { transformStyleTuples } = require("../cssUtil");
const transformVariables = require("../../css-transforms/variables");
/*:: import type { DynamicProps } from '../../factories/types' */
/*::
import type {
  VariableArgs,
  VariableRuleTuple,
  VariableKeyframeTuple,
  Args,
  VariablesStore,
  Style,
  Rule,
  Keyframe,
  TransitionParts,
  AnimationParts,
} from '../types'
*/

const { Component } = React;

/* eslint-disable no-param-reassign */
const getExportedVariables = (props, variablesFromScope) => {
  const appliedRuleVariables = getAppliedRules(
    props.args.ruleTuples,
    props.ownProps
  ).map(rule => rule.exportedVariables || null);
  const definedVariables = Object.assign({}, ...appliedRuleVariables);
  return resolveVariableDependencies(definedVariables, variablesFromScope);
};

const transformPart = /*:: <T: (string[] | string)> */ (
  appliedVariables /*: VariablesStore */,
  part /*: T */
) /*: T */ =>
  // $FlowFixMe
  Array.isArray(part)
    ? part /* Pre-processed */
    : transformVariables(part, appliedVariables);

const transformParts = /*:: <T: TransitionParts | AnimationParts> */ (
  appliedVariables /*: VariablesStore */,
  parts /*: ?T */
) /*: ?T */ => {
  if (parts == null) return null;

  // prettier-ignore
  // $FlowFixMe
  const newPart = ({} /*: T */);
  return Object.keys(parts).reduce((accum, key) => {
    // $FlowFixMe
    accum[key] = transformPart(appliedVariables, parts[key]);
    return accum;
  }, newPart);
};

const createRule = (
  inputRule /*: VariableRuleTuple */,
  style /*: string */,
  appliedVariables /*: VariablesStore */
) /*: Rule */ => {
  const { validate, transitionParts, animationParts } = inputRule;
  // $FlowFixMe
  const transitions /*: ?TransitionParts */ = transformParts(
    appliedVariables,
    transitionParts
  );
  // $FlowFixMe
  const animations /*: ?AnimationParts */ = transformParts(
    appliedVariables,
    animationParts
  );

  return { validate, transitions, animations, style };
};

const createRuleStylesUsingStylesheet = (
  appliedVariables,
  args /*: VariableArgs */
) /*: Args */ => {
  const { transitionedProperties, keyframesStyleTuples, ruleTuples } = args;
  const styles /*: (Style | null)[] */ = ruleTuples.map(
    rule =>
      rule.styleTuples != null
        ? transformStyleTuples(rule.styleTuples, appliedVariables)
        : null
  );

  const styleBody = styles.reduce((accum, style, index) => {
    if (style != null) accum[index] = style;
    return accum;
  }, {});
  const stylesheet = StyleSheet.create(styleBody);

  // $FlowFixMe
  const rules /*: Rule[] */ = ruleTuples.map(
    (rule, index) =>
      rule.styleTuples != null
        ? // $FlowFixMe
          createRule(rule, stylesheet[index], appliedVariables)
        : rule
  );

  const keyframes = Object.keys(keyframesStyleTuples).reduce(
    (accum, keyframeName) => {
      // $FlowFixMe
      const keyframeStyles /*: Keyframe[] */ = keyframesStyleTuples[
        keyframeName
      ].map(
        keyframe =>
          keyframe.styleTuples != null
            ? {
                time: keyframe.time,
                style: transformStyleTuples(
                  keyframe.styleTuples,
                  appliedVariables
                )
              }
            : keyframe
      );
      accum[keyframeName] = keyframeStyles;
      return accum;
    },
    {}
  );

  return { transitionedProperties, keyframes, rules };
};

module.exports = class VariablesStyleSheetManager extends Component /*::<
  DynamicProps<VariableArgs>
>*/ {
  /*::
  styleCache: { [key:string]: Args }
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
    const { styleSheetCache, importedVariables } = this.props.args;

    const ownAppliedVariables = importedVariables.reduce((accum, key) => {
      accum[key] = appliedVariables[key];
      return accum;
    }, {});
    const styleCacheKey = JSON.stringify(ownAppliedVariables);
    const styleCached = styleCacheKey in styleSheetCache;

    const nextArgs = styleCached
      ? styleSheetCache[styleCacheKey]
      : createRuleStylesUsingStylesheet(ownAppliedVariables, this.props.args);

    if (!styleCached) styleSheetCache[styleCacheKey] = nextArgs;

    const nextProps = { ...this.props, args: nextArgs };
    return this.props.children(nextProps);
  }

  render() {
    return React.createElement(
      VariablesProvider,
      { exportedVariables: this.getExportedVariables },
      this.renderWithVariables
    );
  }
};

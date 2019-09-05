// @flow
/* eslint-disable no-param-reassign */
const { varRegExp, varRegExpNonGlobal } = require("../../runtime/cssRegExp");
const getRoot = require("./getRoot");
const { isDirectChildOfKeyframes } = require("./util");
/*:: import type {
  RawVariableArgs,
  RawVariableRuleTuple,
  TransitionParts,
  AnimationParts,
} from './types' */

const varNameRegExp = /^--/;

const walkToArray = walker => {
  const nodes = [];
  walker(node => nodes.push(node));
  return nodes;
};

const getStyleDeclarations = nodes =>
  nodes.filter(node => node.type === "decl" && !varNameRegExp.test(node.prop));

const getStyleTuples = nodes =>
  getStyleDeclarations(nodes).map(node => [node.prop, node.value]);

const getExportedVariables = nodes =>
  nodes
    .filter(node => node.type === "decl" && varNameRegExp.test(node.prop))
    .reduce((accum, node) => {
      accum[node.prop.substring(2)] = node.value;
      return accum;
    }, {});

const transitionAttributes = {
  transition: "_",
  "transition-delay": "delay",
  "transition-duration": "duration",
  "transition-property": "property",
  "transition-timing-function": "timingFunction"
};

const animationAttributes = {
  animation: "_",
  "animation-delay": "delay",
  "animation-duration": "duration",
  "animation-name": "name",
  "animation-timing-function": "timingFunction",
  "animation-iteration-count": "iterations"
};

// TODO: Animation long-hands
const specialTupleNames = [].concat(
  Object.keys(transitionAttributes),
  Object.keys(animationAttributes)
);

const getTransitionAnimation = (styleTuples, attributes) => {
  const tuples = styleTuples.filter(styleTuple => styleTuple[0] in attributes);

  if (tuples.length === 0) return null;

  let accum = {};
  tuples.forEach(([key, value]) => {
    const attributeKey = attributes[key];
    if (attributeKey === "_") {
      accum = { _: value };
    } else {
      accum[attributeKey] = value;
    }
  });

  return accum;
};

const getRuleBody = (rule) /*: RawVariableRuleTuple */ => {
  const { selector } = rule;

  let mediaQuery = null;
  if (
    rule.parent &&
    rule.parent.type === "atrule" &&
    rule.parent.name === "media"
  ) {
    mediaQuery = rule.parent.params;
  }

  let styleTuples = getStyleTuples(rule.nodes);

  const transitionParts /*: ?TransitionParts */ = getTransitionAnimation(
    styleTuples,
    transitionAttributes
  );
  const animationParts /*: ?AnimationParts */ = getTransitionAnimation(
    styleTuples,
    animationAttributes
  );

  styleTuples = styleTuples.filter(
    styleTuple => !specialTupleNames.includes(styleTuple[0])
  );

  const exportedVariables = getExportedVariables(rule.nodes);

  return {
    selector,
    mediaQuery,
    exportedVariables,
    transitionParts,
    animationParts,
    styleTuples
  };
};

const getKeyframes = atRule =>
  walkToArray(cb => atRule.walkRules(cb))
    .reduce((accum, rule) => {
      const timeSelectors = rule.selector
        .split(",")
        .map(selector => selector.trim())
        .map(selector => {
          if (/[\d.]%/.test(selector)) return parseFloat(selector) / 100;
          if (/start/i.test(selector)) return 0;
          if (/end/i.test(selector)) return 1;
          throw new Error(`Cannot parse keyframe time: ${selector}`);
        });

      const styleTuples = getStyleTuples(walkToArray(cb => rule.walkDecls(cb)));

      const newKeyframeBlocks = timeSelectors.map(time => ({
        time,
        styleTuples
      }));
      return accum.concat(newKeyframeBlocks);
    }, [])
    .sort((a, b) => a.time - b.time);

const getImportedVariables = root => {
  const rule = new Set();
  const transition = new Set();
  const animation = new Set();
  const keyframe = new Set();

  root.walkDecls(decl => {
    if (varNameRegExp.test(decl.prop)) return;

    const referencedVariableMatches = decl.value.match(varRegExp);
    if (!referencedVariableMatches) return;

    const referencedVariables = referencedVariableMatches.map(
      match => match.match(varRegExpNonGlobal)[1]
    );

    let type;
    if (/^transition(?:-|$)/i.test(decl.prop)) {
      type = transition;
    } else if (/^animation(?:-|$)/i.test(decl.prop)) {
      type = animation;
    } else if (isDirectChildOfKeyframes(decl.parent)) {
      type = keyframe;
    } else {
      type = rule;
    }

    referencedVariables.forEach(v => type.add(v));
  });

  return {
    rule: Array.from(rule),
    transition: Array.from(transition),
    animation: Array.from(animation),
    keyframe: Array.from(keyframe)
  };
};

module.exports = (
  inputCss /*: string */
) /*: ({ propTypes: Object, args: RawVariableArgs }) */ => {
  const { root, propTypes } = getRoot(inputCss);

  const ruleTuples = walkToArray(cb => root.walkRules(cb))
    .filter(rule => !isDirectChildOfKeyframes(rule))
    .map(getRuleBody);

  const keyframesStyleTuples = walkToArray(cb => root.walkAtRules(cb))
    .filter(atRule => atRule.name === "keyframes")
    .reduce((accum, atRule) => {
      accum[atRule.params] = getKeyframes(atRule);
      return accum;
    }, {});

  const {
    rule: importedRuleVariables,
    transition: importedTransitionVariables,
    animation: importedAnimationVariables,
    keyframe: importedKeyframeVariables
  } = getImportedVariables(root);

  return {
    propTypes,
    ruleTuples,
    importedRuleVariables,
    importedTransitionVariables,
    importedAnimationVariables,
    importedKeyframeVariables,
    keyframesStyleTuples
  };
};

// @flow
/* eslint-disable no-param-reassign */
const { getPropertyName } = require("css-to-react-native");
const getRoot = require("../util/getRoot");
const { varRegExp, varRegExpNonGlobal } = require("../util/cssRegExp");
const { isDirectChildOfKeyframes } = require("../util/cssAst");
/*:: import type {
  RawVariableArgs,
  RawVariableRuleTuple,
  TransitionParts,
  AnimationParts,
} from './types' */

const variableRegExp = /^--/;
// Matches whole words, or whole functions (i.e. `var(--hello, with spaces here)`)
const transitionPartRegExp = /([^\s(]+(?:\([^)]*\))?)/g;
const nonTransitionPropertyRegExp = /(?:ease(?:-in)?(?:-out)?|linear|^\d|\()/;

const walkToArray = walker => {
  const nodes = [];
  walker(node => nodes.push(node));
  return nodes;
};

const getStyleDeclarations = nodes =>
  nodes.filter(node => node.type === "decl" && !variableRegExp.test(node.prop));

const getStyleTuples = nodes =>
  getStyleDeclarations(nodes).map(node => [node.prop, node.value]);

const getExportedVariables = nodes =>
  nodes
    .filter(node => node.type === "decl" && variableRegExp.test(node.prop))
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

const getTransitionShorthand = (declValue) /*: TransitionParts */ =>
  declValue.split(/\s*,\s*/).reduce(
    (accum, value) => {
      const parts = value.match(transitionPartRegExp) || [];

      const property =
        parts != null
          ? parts.filter(part => !nonTransitionPropertyRegExp.test(part))
          : [];

      if (property.length > 1) {
        throw new Error(
          "Expected shorthand transition to be able to statically determine transitioned properties"
        );
      }

      const transitionParts = parts
        .filter(part => nonTransitionPropertyRegExp.test(part))
        .join(" ");

      accum._ =
        accum._.length !== 0
          ? `${accum._}, ${transitionParts}`
          : transitionParts;

      if (property.length === 1) {
        accum.property.push(getPropertyName(property[0]));
      }

      return accum;
    },
    { _: "", property: [] }
  );

const getTransition = (styleTuples) /*: ?TransitionParts */ => {
  const transitionTuples = styleTuples.filter(
    styleTuple => styleTuple[0] in transitionAttributes
  );

  if (transitionTuples.length === 0) return null;

  return transitionTuples.reduce((accum, [key, value]) => {
    switch (key) {
      case "transition":
        // Clear previous transition-* properties
        return getTransitionShorthand(value);
      case "transition-property":
        return { ...accum, property: value.split(/\s*,\s*/) };
      default: {
        return { ...accum, [transitionAttributes[key]]: value };
      }
    }
  }, {});
};

const getAnimation = styleTuples => {
  const animationTuples = styleTuples.filter(
    styleTuple => styleTuple[0] in animationAttributes
  );

  if (animationTuples.length === 0) return null;

  return animationTuples.reduce((accum, [key, value]) => {
    switch (key) {
      case "animation":
        // Clear previous animation-* properties
        return { _: value };
      default:
        return { ...accum, [animationAttributes[key]]: value };
    }
  }, {});
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

  const transitionParts /*: ?TransitionParts */ = getTransition(styleTuples);
  const animationParts /*: ?AnimationParts */ = getAnimation(styleTuples);

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
  const keyMirror = walkToArray(cb => root.walkDecls(cb)).reduce(
    (accum, decl) => {
      const referencedVariableMatches = decl.value.match(varRegExp);
      if (!referencedVariableMatches) return accum;

      const referencedVariables = referencedVariableMatches.map(
        match => match.match(varRegExpNonGlobal)[1]
      );

      return referencedVariables.reduce((innerAccum, variable) => {
        innerAccum[variable] = true;
        return innerAccum;
      }, accum);
    },
    {}
  );
  return Object.keys(keyMirror);
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

  let transitionedProperties = ruleTuples.reduce(
    (accum, rule) =>
      rule.transitionParts && rule.transitionParts.property
        ? accum.concat(rule.transitionParts.property)
        : accum,
    []
  );
  transitionedProperties = Array.from(new Set(transitionedProperties));

  const importedVariables = getImportedVariables(root);

  // We want to share stylesheet caches by component rather than by instance
  // Just make a mutable object VariablesStyleSheetManager can store cache values in
  const styleSheetCache = {};

  const args = {
    styleSheetCache,
    transitionedProperties,
    importedVariables,
    keyframesStyleTuples,
    ruleTuples
  };

  return { propTypes, args };
};

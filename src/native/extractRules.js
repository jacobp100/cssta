// @flow
/* eslint-disable no-param-reassign */
const { getPropertyName } = require("css-to-react-native");
const getRoot = require("../util/getRoot");
const { varRegExp, varRegExpNonGlobal } = require("../util/cssRegExp");
const { isDirectChildOfKeyframes } = require("../util/cssAst");
/*:: import type { RawVariableArgs, RawVariableRuleTuple, TransitionParts, TransitionAttributes } from './types' */

const variableRegExp = /^--/;
// Matches whole words, or whole functions (i.e. `var(--hello, with spaces here)`)
const transitionPartRegExp = /([^\s(]+(?:\([^)]*\))?)/g;
const nonTransitionPropertyRegExp = /(?:ease(?:-in)?(?:-out)?|linear|^\d|\()/;

const findLast = (array, cb) =>
  array
    .slice()
    .reverse()
    .find(cb);

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

const getAnimation = declValue => declValue.match(transitionPartRegExp);

const transitionTupleNames = [
  "transition",
  "transition-delay",
  "transition-duration",
  "transition-property",
  "transition-timing-function"
];

const emptyTransitionAttributes /*: TransitionAttributes */ = {
  delay: null,
  duration: null,
  timingFunction: null
};

const emptyTransitionParts /*: TransitionParts */ = {
  property: [],
  shorthand: null,
  attributes: emptyTransitionAttributes
};

// TODO: Animation long-hands
const specialTupleNames = transitionTupleNames.concat(["animation"]);

const splitShorthandProperties = declValue =>
  declValue.split(/\s*,\s*/).reduce(
    (accum, value) => {
      const parts = value.match(transitionPartRegExp);

      const property =
        parts != null
          ? parts.find(part => !nonTransitionPropertyRegExp.test(part))
          : null;

      if (parts == null || property == null) {
        throw new Error(
          "Expected shorthand transition to be able to statically determine transitioned properties"
        );
      }

      const transitionParts = parts.filter(part =>
        nonTransitionPropertyRegExp.test(part)
      );

      accum.property.push(getPropertyName(property));
      accum.shorthand.push(transitionParts);
      return accum;
    },
    { property: [], shorthand: [] }
  );

const attrs = {
  "transition-delay": "delay",
  "transition-duration": "duration",
  "transition-timing-function": "timingFunction"
};

const getTransition = (styleTuples) /*: ?TransitionParts */ => {
  const transitionTuples = styleTuples.filter(styleTuple =>
    transitionTupleNames.includes(styleTuple[0])
  );

  if (transitionTuples.length === 0) return null;

  return transitionTuples.reduce(
    ({ property, shorthand, attributes }, [key, value]) => {
      switch (key) {
        case "transition": {
          const { property: p, shorthand: s } = splitShorthandProperties(value);
          return { property: p, shorthand: s, attributes };
        }
        case "transition-property":
          return { property: value.split(/\s*,\s*/), shorthand, attributes };
        default: {
          const attribute = attrs[key];
          if (attribute == null) Error("Internal error");
          const a = Object.assign({}, attributes);
          a[attribute] = value;
          return { property, shorthand, attributes: a };
        }
      }
    },
    emptyTransitionParts
  );
};

const getRuleBody = (rule) /*: RawVariableRuleTuple */ => {
  const { selector } = rule;
  let styleTuples = getStyleTuples(rule.nodes);

  const transitionParts /*: ?TransitionParts */ = getTransition(styleTuples);

  const animationDeclValue = findLast(
    styleTuples,
    styleTuple => styleTuple[0] === "animation"
  );
  const animationParts = animationDeclValue
    ? getAnimation(animationDeclValue[1])
    : null;

  styleTuples = styleTuples.filter(
    styleTuple => !specialTupleNames.includes(styleTuple[0])
  );

  const exportedVariables = getExportedVariables(rule.nodes);

  return {
    selector,
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

  const transitionedProperties = Object.keys(
    Object.assign({}, ...ruleTuples.map(rule => rule.transitionParts))
  );

  const importedVariables = getImportedVariables(root);

  const args = {
    transitionedProperties,
    importedVariables,
    keyframesStyleTuples,
    ruleTuples
  };

  return { propTypes, args };
};

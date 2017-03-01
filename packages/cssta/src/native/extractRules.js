/* eslint-disable no-param-reassign */
const { transformRawValue, getPropertyName } = require('css-to-react-native');
const getRoot = require('../util/getRoot');
const { varRegExp, varRegExpNonGlobal, isDirectChildOfKeyframes } = require('../util');

const variableRegExp = /^--/;
// Matches whole words, or whole functions (i.e. `var(--hello, with spaces here)`)
const transitionPartRegExp = /([^\s(]+(?:\([^)]*\))?)/g;
const nonTransitionPropertyRegExp = /(?:ease(?:-in|-out)?|linear|^\d|\()/;

const findLast = (array, cb) => array.slice().reverse().find(cb);
const walkToArray = (walker) => {
  const nodes = [];
  walker(node => nodes.push(node));
  return nodes;
};

const getStyleDeclarations = nodes => nodes
  .filter(node => node.type === 'decl' && !variableRegExp.test(node.prop));

const getStyleTuples = nodes => getStyleDeclarations(nodes)
  .map(node => [node.prop, node.value]);

const getExportedVariables = nodes => nodes
  .filter(node => node.type === 'decl' && variableRegExp.test(node.prop))
  .reduce((accum, node) => {
    accum[node.prop.substring(2)] = node.value;
    return accum;
  }, {});

const getImportedVariables = nodes => getStyleDeclarations(nodes)
  .reduce((accum, decl) => {
    const referencedVariableMatches = decl.value.match(varRegExp);
    if (!referencedVariableMatches) return accum;

    const referencedVariables = referencedVariableMatches
      .map(match => match.match(varRegExpNonGlobal)[1]);

    return accum.concat(referencedVariables);
  }, []);

const getTransitions = declValue => declValue
  .split(',')
  .reduce((transitions, value) => {
    const parts = value.match(transitionPartRegExp);

    if (!parts) return transitions;

    const properties = parts
      .filter(part => !nonTransitionPropertyRegExp.test(part))
      .map(getPropertyName);
    const transitionParts = parts
      .filter(part => nonTransitionPropertyRegExp.test(part));

    return properties.reduce((accum, property) => {
      accum[property] = transitionParts;
      return accum;
    }, transitions);
  }, {});

const getAnimation = declValue => declValue.match(transitionPartRegExp);

const specialTuples = ['transition', 'animation'];

const getRuleBody = (rule) => {
  const { selector } = rule;
  let styleTuples = getStyleTuples(rule.nodes);

  const transitionDeclValue = findLast(styleTuples, styleTuple => styleTuple[0] === 'transition');
  const transitions = transitionDeclValue ? getTransitions(transitionDeclValue[1]) : {};

  const animationDeclValue = findLast(styleTuples, styleTuple => styleTuple[0] === 'animation');
  const animation = transitionDeclValue ? getAnimation(animationDeclValue[1]) : null;

  styleTuples = styleTuples.filter(styleTuple => specialTuples.includes(styleTuple[0]));

  const exportedVariables = getExportedVariables(rule.nodes);
  const importedVariables = getImportedVariables(rule.nodes);

  return {
    selector, styleTuples, transitions, animation, exportedVariables, importedVariables,
  };
};

const getAnimatedProperties = (atRule) => {
  const properties = [];

  atRule.walkDecls((decl) => {
    const { prop } = decl;
    if (!properties.includes(prop)) properties.push(prop);
  });

  const keyframeBlocks = walkToArray(cb => atRule.walkRules(cb))
    .reduce((accum, rule) => {
      const timeSelectors = rule.selector
        .split(',')
        .map(selector => selector.trim())
        .map((selector) => {
          if (/[\d.]%/.test(selector)) return parseFloat(selector) / 100;
          if (/start/i.test(selector)) return 0;
          if (/end/i.test(selector)) return 1;
          throw new Error(`Cannot parse keyframe time: ${selector}`);
        });

      const newKeyframeBlocks = timeSelectors.map(time => ({ time, rule }));
      return accum.concat(newKeyframeBlocks);
    }, [])
    .sort((a, b) => a.time - b.time);

  const animatedProperties = properties.reduce((accum, property) => {
    const values = keyframeBlocks
      .map(({ time, rule }) => {
        const decls = walkToArray(cb => rule.walkDecls(cb));
        const decl = findLast(decls, node => node.prop === property);
        const value = transformRawValue(decl.value);
        // FIXME: css-to-react-native
        return decl ? { time, value } : null;
      })
      .filter(value => value !== null);
    accum[property] = values;
    return accum;
  });

  return animatedProperties;
};

module.exports = (inputCss) => {
  const { root, propTypes } = getRoot(inputCss);

  const rules = walkToArray(cb => root.walkRules(cb))
    .filter(rule => !isDirectChildOfKeyframes(rule))
    .map(getRuleBody);

  const keyframes = walkToArray(cb => root.walkAtRules(cb))
    .filter(atRule => atRule.name === 'keyframes')
    .reduce((accum, atRule) => {
      accum[atRule.params] = getAnimatedProperties(atRule);
      return accum;
    }, {});

  const animatedProperties =
    Object.keys(Object.assign({}, ...Object.values(keyframes)));
  const transitionedProperties =
    Object.keys(Object.assign({}, ...rules.map(rule => rule.transitions)));

  const importedVariables = rules.reduce((outerAccum, rule) => (
    rule.importedVariables.reduce((innerAccum, importedVariable) => (
      innerAccum.indexOf(importedVariable) === -1
        ? innerAccum.concat([importedVariable])
        : innerAccum
    ), outerAccum)
  ), []);

  const managerArgs = { keyframes, animatedProperties, transitionedProperties, importedVariables };

  return { rules, propTypes, managerArgs };
};

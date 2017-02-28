/* eslint-disable no-param-reassign */
const { getPropertyName } = require('css-to-react-native');
const getRoot = require('../util/getRoot');
const { varRegExp, varRegExpNonGlobal } = require('../util');

const variableRegExp = /^--/;
// Matches whole words, or whole functions (i.e. `var(--hello, with spaces here)`)
const transitionPartRegExp = /([^\s(]+(?:\([^)]*\))?)/g;
const nonTransitionPropertyRegExp = /(?:ease(?:-in|-out)?|linear|^\d|\()/;

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

module.exports = (inputCss) => {
  const { root, propTypes } = getRoot(inputCss);

  const rules = [];

  root.walkRules((node) => {
    const { selector } = node;
    let styleTuples = getStyleTuples(node.nodes);

    // findLast (not in spec)
    const transitionDeclValue = styleTuples.reduce((currentValue, styleTuple) => (
      styleTuple[0] === 'transition' ? styleTuple[1] : currentValue
    ), null);
    const transitions = transitionDeclValue
      ? getTransitions(transitionDeclValue)
      : {};

    styleTuples = styleTuples.filter(styleTuple => styleTuple[0] !== 'transition');

    const exportedVariables = getExportedVariables(node.nodes);
    const importedVariables = getImportedVariables(node.nodes);

    rules.push({ selector, styleTuples, transitions, exportedVariables, importedVariables });
  });

  const transitions = Object.keys(Object.assign({}, ...rules.map(rule => rule.transitions)));

  const importedVariables = rules.reduce((outerAccum, rule) => (
    rule.importedVariables.reduce((innerAccum, importedVariable) => (
      innerAccum.indexOf(importedVariable) === -1
        ? innerAccum.concat([importedVariable])
        : innerAccum
    ), outerAccum)
  ), []);

  const managerArgs = { transitions, importedVariables };

  return { rules, propTypes, managerArgs };
};

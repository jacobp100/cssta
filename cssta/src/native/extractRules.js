/* eslint-disable no-param-reassign */
const getRoot = require('../util/getRoot');
const { varRegExp, varRegExpNonGlobal } = require('../util');

const variableRegExp = /^--/;

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

module.exports = (inputCss) => {
  const { root, propTypes } = getRoot(inputCss);

  const rules = [];

  root.walkRules((node) => {
    rules.push({
      selector: node.selector,
      styleTuples: getStyleTuples(node.nodes),
      exportedVariables: getExportedVariables(node.nodes),
      importedVariables: getImportedVariables(node.nodes),
    });
  });

  const importedVariables = rules.reduce((outerAccum, rule) => (
    rule.importedVariables.reduce((innerAccum, importedVariable) => (
      innerAccum.indexOf(importedVariable) === -1
        ? innerAccum.concat([importedVariable])
        : innerAccum
    ), outerAccum)
  ), []);

  return { rules, propTypes, importedVariables };
};

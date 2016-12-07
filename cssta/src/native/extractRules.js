/* eslint-disable no-param-reassign */
const getRoot = require('../util/getRoot');

const variableRegExp = /^--/;

const getStyleTuples = nodes => nodes
  .filter(node => node.type === 'decl' && !variableRegExp.test(node.prop))
  .map(node => [node.prop, node.value]);

const getVariables = nodes => nodes
  .filter(node => node.type === 'decl' && variableRegExp.test(node.prop))
  .reduce((accum, node) => {
    accum[node.prop.substring(2)] = node.value;
    return accum;
  }, {});

module.exports = (inputCss) => {
  const { root, propTypes } = getRoot(inputCss);

  const rules = [];

  root.walkRules((node) => {
    rules.push({
      selector: node.selector,
      styleTuples: getStyleTuples(node.nodes),
      variables: getVariables(node.nodes),
    });
  });

  return { rules, propTypes };
};

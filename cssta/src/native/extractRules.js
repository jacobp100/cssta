/* eslint-disable no-param-reassign */
const cssToReactNative = require('css-to-react-native').default;
const getRoot = require('../util/getRoot');

const getBody = nodes => cssToReactNative(nodes
  .filter(node => node.type === 'decl')
  .map(node => [node.prop, node.value])
);

module.exports = (inputCss) => {
  let i = 0;
  const getStyleName = () => {
    i += 1;
    return `style${i}`;
  };

  const { root, propTypes } = getRoot(inputCss);

  const baseRules = [];

  root.walkRules((node) => {
    baseRules.push({
      selector: node.selector,
      body: getBody(node.nodes),
      styleName: getStyleName(),
    });
  });

  const styleSheetBody = baseRules.reduce((accum, rule) => {
    accum[rule.styleName] = rule.body;
    return accum;
  }, {});

  const rules = baseRules.map(rule => ({
    selector: rule.selector,
    styleName: rule.styleName,
  }));

  return { rules, styleSheetBody, propTypes };
};

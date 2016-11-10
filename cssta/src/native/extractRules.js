/* eslint-disable no-param-reassign */
const bodyTransform = require('./bodyTransform');
const getRoot = require('../util/getRoot');

let i = 0;
const getStyleName = () => {
  i += 1;
  return `style${i}`;
};

module.exports = (inputCss) => {
  const { root, propTypes } = getRoot(inputCss);

  const baseRules = [];

  root.walkRules((node) => {
    baseRules.push({
      selector: node.selector,
      body: bodyTransform(node.nodes),
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

module.exports.resetStyleNames = () => {
  i = 0;
};

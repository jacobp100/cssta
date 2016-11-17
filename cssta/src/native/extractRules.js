/* eslint-disable no-param-reassign */
const cssToReactNative = require('css-to-react-native').default;
const getRoot = require('../util/getRoot');


/* Note that the keys to substitutionMap should not contain RegExp characters!!! */
/* Done like this to have consistent interpolation. See tests. */
module.exports = (inputCss, substitutionMap = {}) => {
  let i = 0;
  const getStyleName = () => {
    i += 1;
    return `style${i}`;
  };

  const substitutions = Object.keys(substitutionMap);
  const substitionRegExps = substitutions.reduce((accum, substitutionName) => {
    accum[substitutionName] = new RegExp(substitutionName, 'g');
    return accum;
  }, {});

  const getValue = value => substitutions.reduce((accum, substitutionName) => (
    accum.replace(substitionRegExps[substitutionName], substitutionMap[substitutionName])
  ), value);

  const getBody = nodes => cssToReactNative(nodes
    .filter(node => node.type === 'decl')
    .map(node => [node.prop, getValue(node.value)])
  );

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

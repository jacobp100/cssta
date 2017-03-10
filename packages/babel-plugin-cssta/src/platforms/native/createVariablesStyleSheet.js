/* eslint-disable no-param-reassign */
const t = require('babel-types');
const _ = require('lodash/fp');
const { getPropertyName } = require('css-to-react-native');
const { getStringWithSubstitutedValues, baseRuleElements } = require('./util');

module.exports = (path, substitutionMap, rules) => {
  const createStyleTuples = ({ styleTuples }) => t.arrayExpression(_.map(([prop, value]) => (
    t.arrayExpression([
      t.stringLiteral(getPropertyName(prop)),
      getStringWithSubstitutedValues(substitutionMap, value),
    ])
  ), styleTuples));

  const rulesBody = t.arrayExpression(_.map(rule => t.objectExpression([
    ...baseRuleElements(rule),
    t.objectProperty(
      t.stringLiteral('styleTuples'),
      createStyleTuples(rule)
    ),
  ]), rules));

  return rulesBody;
};

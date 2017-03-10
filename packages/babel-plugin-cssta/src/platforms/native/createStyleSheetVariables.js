/* eslint-disable no-param-reassign */
const t = require('babel-types');
const _ = require('lodash/fp');
const { getPropertyName } = require('css-to-react-native');
const { getStringWithSubstitutedValues } = require('./util');
const { baseRuleElements } = require('./createUtil');

const createStyleTuples = (
  substitutionMap,
  { styleTuples }
) => t.arrayExpression(_.map(([prop, value]) => (
  t.arrayExpression([
    t.stringLiteral(getPropertyName(prop)),
    getStringWithSubstitutedValues(substitutionMap, value),
  ])
), styleTuples));

module.exports = (path, substitutionMap, rules) =>
  t.arrayExpression(_.map(rule => t.objectExpression([
    ...baseRuleElements(rule),
    t.objectProperty(
      t.stringLiteral('styleTuples'),
      createStyleTuples(substitutionMap, rule)
    ),
  ]), rules));

/* eslint-disable no-param-reassign */
const t = require('babel-types');
const { parse } = require('babylon');
const _ = require('lodash/fp');
const { getValidatorSourceForSelector } = require('cssta/src/native/selectorTransform');
const { jsonToNode, getSubstitutionRegExp } = require('../../util');

const getTemplateValues = cooked => ({
  cooked,
  raw: JSON.stringify(cooked).slice(1, -1),
});

const createValidatorNodeForSelector = selector =>
  parse(getValidatorSourceForSelector(selector)).program.body[0].expression;

const jsonObjectProperties = _.flow(
  _.toPairs,
  _.map(([key, value]) => t.objectProperty(t.stringLiteral(key), jsonToNode(value)))
);

const baseRuleElements = rule => [
  t.objectProperty(
    t.stringLiteral('validate'),
    createValidatorNodeForSelector(rule.selector)
  ),
  ..._.flow(
    _.pick(['transitions', 'exportedVariables', 'animation']),
    jsonObjectProperties
  )(rule),
];

const getStringWithSubstitutedValues = (substitutionMap, value) => {
  /* Don't attempt to optimise `${value}`: it converts to a string and we need that */
  const allValues = !_.isEmpty(substitutionMap)
    ? _.chunk(2, value.split(getSubstitutionRegExp(substitutionMap)))
    : [[value]];
  const quasiValues = _.map(0, allValues);
  const expressionValues = _.dropLast(1, _.map(1, allValues));

  if (_.isEmpty(expressionValues)) return t.stringLiteral(quasiValues[0]);

  const quasis = [].concat(
    _.map(cooked => t.templateElement(getTemplateValues(cooked)), _.initial(quasiValues)),
    t.templateElement(getTemplateValues(_.last(quasiValues)), true)
  );
  const expressions = _.map(_.propertyOf(substitutionMap), expressionValues);

  return t.templateLiteral(quasis, expressions);
};

module.exports.getTemplateValues = getTemplateValues;
module.exports.createValidatorNodeForSelector = createValidatorNodeForSelector;
module.exports.jsonObjectProperties = jsonObjectProperties;
module.exports.baseRuleElements = baseRuleElements;
module.exports.getStringWithSubstitutedValues = getStringWithSubstitutedValues;

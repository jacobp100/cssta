const t = require('babel-types');
const _ = require('lodash/fp');
const { jsonToNode, getSubstitutionRegExp } = require('../../util');
const { varRegExp } = require('cssta/lib/util');

const getTemplateValues = cooked => ({
  cooked,
  raw: JSON.stringify(cooked).slice(1, -1),
});
const jsonObjectProperties = _.flow(
  _.toPairs,
  _.map(([key, value]) => t.objectProperty(t.stringLiteral(key), jsonToNode(value)))
);

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

const styleHasVariable = style => style && varRegExp.test(style);
const styleTupleHasVariable = styleTuple => styleHasVariable(styleTuple[1]);

module.exports.getTemplateValues = getTemplateValues;
module.exports.jsonObjectProperties = jsonObjectProperties;
module.exports.getStringWithSubstitutedValues = getStringWithSubstitutedValues;
module.exports.styleHasVariable = styleHasVariable;
module.exports.styleTupleHasVariable = styleTupleHasVariable;

const t = require("babel-types");
const { parse } = require("babylon");
const _ = require("lodash/fp");
const {
  getValidatorSourceForSelector
} = require("cssta/src/native/selectorTransform");
const { jsonObjectProperties } = require("./util");

const createValidatorNodeForSelector = selector =>
  parse(getValidatorSourceForSelector(selector)).program.body[0].expression;

module.exports.baseRuleElements = rule => [
  t.objectProperty(
    t.stringLiteral("validate"),
    createValidatorNodeForSelector(rule.selector)
  )
];

module.exports.commonArgs = _.flow(
  _.pick(["transitionedProperties"]),
  jsonObjectProperties
);

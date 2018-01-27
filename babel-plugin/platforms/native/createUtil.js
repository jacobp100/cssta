const { parse } = require("babylon");
const _ = require("lodash/fp");
const {
  getValidatorSourceForSelector
} = require("../../../src/native/selectorTransform");
const { jsonObjectProperties } = require("./util");

const createValidatorNodeForSelector = selector =>
  parse(getValidatorSourceForSelector(selector)).program.body[0].expression;

module.exports.baseRuleElements = ({ types: t }, rule) => [
  t.objectProperty(
    t.stringLiteral("validate"),
    createValidatorNodeForSelector(rule.selector)
  )
];

module.exports.commonArgs = (babel, object) =>
  jsonObjectProperties(babel, _.pick(["transitionedProperties"], object));

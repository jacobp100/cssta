const _ = require("lodash/fp");
const {
  getValidatorSourceForSelector
} = require("../../../src/native/selectorTransform");
const { jsonObjectProperties } = require("./util");

const createValidatorNodeForSelector = (babel, { selector, mediaQuery }) =>
  babel.transform(getValidatorSourceForSelector(selector, mediaQuery)).ast
    .program.body[0].expression;

module.exports.baseRuleElements = (babel, rule) => [
  babel.types.objectProperty(
    babel.types.stringLiteral("validate"),
    createValidatorNodeForSelector(babel, rule)
  )
];

module.exports.commonArgs = (babel, object) =>
  jsonObjectProperties(babel, _.pick(["transitionedProperties"], object));

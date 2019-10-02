// @flow
const selectorTransform = require("./selectorTransform");

module.exports = (babel, path, { ruleTuples }) => {
  const cache = {};

  const selectorFunctions = ruleTuples.reduce((accum, rule) => {
    const ruleCondition = selectorTransform(babel, path, rule, { cache });
    if (ruleCondition != null) accum.set(rule, ruleCondition);
    return accum;
  }, new Map());

  return selectorFunctions;
};

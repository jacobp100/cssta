// @flow
/*:: import type { VariableWithValidator } from './types' */

module.exports.getAppliedRules = /*:: <T: VariableWithValidator> */ (
  rules /*: T[] */,
  ownProps /*: Object */
) /*: T[] */ =>
  rules.filter(rule => (rule.validate ? rule.validate(ownProps) : true));

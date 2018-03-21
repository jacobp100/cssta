// @flow
/*
CAUTION!

This file could be included even after running the babel plugin.

Make sure you don't import large libraries.
*/
/*:: import type { VariableWithValidator } from './types' */

module.exports.getAppliedRules = /*:: <T: VariableWithValidator> */ (
  rules /*: T[] */,
  ownProps /*: Object */
) /*: T[] */ =>
  rules.filter(
    rule => (rule.validate != null ? rule.validate(ownProps) : true)
  );

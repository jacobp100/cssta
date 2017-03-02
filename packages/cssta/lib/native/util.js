"use strict";

module.exports.getAppliedRules = function (rules, ownProps) {
  return rules.filter(function (rule) {
    return rule.validate ? rule.validate(ownProps) : true;
  });
};
module.exports.getAppliedRules = (rules, ownProps) =>
  rules.filter(rule => rule.validate(ownProps));

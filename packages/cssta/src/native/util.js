module.exports.getAppliedRules = (rules, ownProps) =>
  rules.filter(rule => (rule.validate ? rule.validate(ownProps) : true));

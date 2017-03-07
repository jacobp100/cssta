/* eslint-disable no-param-reassign */
const componentFactory = require('../factories/componentFactory');
const { getAppliedRules } = require('./util');

module.exports = componentFactory((ownProps, passedProps, args) => {
  let style = getAppliedRules(args.rules, ownProps).map(rule => rule.style);

  if ('style' in passedProps) style = style.concat(passedProps.style);
  if (style.length > 0) passedProps.style = style;

  return passedProps;
});

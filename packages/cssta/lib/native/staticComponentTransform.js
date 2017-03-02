'use strict';

var _require = require('./util'),
    getAppliedRules = _require.getAppliedRules;
/* eslint-disable no-param-reassign */

/*
type Rule = {
  validate: Props => boolean,
  style: Style,
};
*/

module.exports = function (ownProps, passedProps, rules) {
  var style = getAppliedRules(rules, ownProps).map(function (rule) {
    return rule.style;
  });

  if ('style' in passedProps) style = style.concat(passedProps.style);
  if (style.length > 0) passedProps.style = style;

  return passedProps;
};
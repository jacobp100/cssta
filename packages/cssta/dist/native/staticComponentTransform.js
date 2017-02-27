'use strict';

/* eslint-disable no-param-reassign */

/*
type Rule = {
  validate: Props => boolean,
  style: Style,
};
*/

module.exports = function (ownProps, passedProps, rules) {
  var style = rules.filter(function (rule) {
    return rule.validate(ownProps);
  }).map(function (rule) {
    return rule.style;
  });

  if ('style' in passedProps) style = style.concat(passedProps.style);
  if (style.length > 0) passedProps.style = style;

  return passedProps;
};
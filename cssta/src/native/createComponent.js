/* eslint-disable no-param-reassign */
const createComponentFactory = require('../util/createComponentFactory');

module.exports = createComponentFactory((ownProps, passedProps, rules) => {
  let style = rules
    .filter(rule => rule.validate(ownProps))
    .map(rule => rule.style);

  if ('style' in passedProps) style = style.concat(passedProps.style);
  if (style.length > 0) passedProps.style = style;

  return passedProps;
});

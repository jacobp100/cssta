/* eslint-disable no-param-reassign */
const createComponentFactory = require('../util/createComponentFactory');

module.exports = createComponentFactory((ownProps, passedProps, rules) => {
  const style = rules
    .filter(rule => rule.validate(ownProps))
    .map(rule => rule.style);

  if ('style' in passedProps) passedProps.style = style.concat(passedProps.style);

  return passedProps;
});

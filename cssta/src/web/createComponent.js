/* eslint-disable no-param-reassign */
const createComponentFactory = require('../util/createComponentFactory');

/*
rules = {
  prop: {
    value: className
  },
};
*/

module.exports = createComponentFactory((ownProps, passedProps, defaultClassName, classNameMap) => {
  const classNames = Object.keys(ownProps)
    .map(propName => classNameMap[propName][ownProps[propName]])
    .filter(Boolean); // remove undefined values

  if (defaultClassName) classNames.push(defaultClassName);
  if (passedProps.className) classNames.push(passedProps.className);

  const className = classNames.join(' ');
  if (className) passedProps.className = className;

  return passedProps;
});

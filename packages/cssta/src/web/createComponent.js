/* eslint-disable no-param-reassign */
const componentFactory = require('../factories/componentFactory');

/*
rules = {
  prop: {
    value: className
  },
};
*/

const factory = componentFactory((ownProps, passedProps, args) => {
  const { defaultClassName, classNameMap } = args;
  const classNames = Object.keys(ownProps)
    .map(propName => classNameMap[propName][ownProps[propName]])
    .filter(Boolean); // remove undefined values

  if (defaultClassName) classNames.push(defaultClassName);
  if (passedProps.className) classNames.push(passedProps.className);

  const className = classNames.join(' ');
  if (className) passedProps.className = className;

  return passedProps;
});

// Optimisation allows not passing propTypes on prod
module.exports = (component, propTypes, args) =>
  factory(component, propTypes || Object.keys(args.classNameMap), args);

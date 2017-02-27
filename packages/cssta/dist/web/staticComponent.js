'use strict';

/* eslint-disable no-param-reassign */
var staticComponentFactory = require('../factories/staticComponentFactory');

/*
rules = {
  prop: {
    value: className
  },
};
*/

var factory = staticComponentFactory(function (ownProps, passedProps, defaultClassName, classNameMap) {
  var classNames = Object.keys(ownProps).map(function (propName) {
    return classNameMap[propName][ownProps[propName]];
  }).filter(Boolean); // remove undefined values

  if (defaultClassName) classNames.push(defaultClassName);
  if (passedProps.className) classNames.push(passedProps.className);

  var className = classNames.join(' ');
  if (className) passedProps.className = className;

  return passedProps;
});

// Optimisation allows not passing propTypes on prod
module.exports = function (component, propTypes, defaultClassName, classNameMap) {
  return factory(component, propTypes || Object.keys(classNameMap), defaultClassName, classNameMap);
};
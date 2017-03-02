'use strict';

/* eslint-disable no-param-reassign */
var React = require('react');

var PropTypes = React.PropTypes;


module.exports.getOwnPropKeys = function (propTypes) {
  return Array.isArray(propTypes) ? propTypes : Object.keys(propTypes);
};

module.exports.getComponentProps = function (ownPropKeys, component, props) {
  return Object.keys(props).reduce(function (accum, key) {
    var prop = props[key];

    if (key === 'component') {
      accum.Element = prop;
    } else if (ownPropKeys.indexOf(key) !== -1) {
      accum.ownProps[key] = prop;
    } else {
      accum.passedProps[key] = prop;
    }

    return accum;
  }, {
    Element: component,
    ownProps: {},
    passedProps: {}
  });
};

if (process.env.NODE_ENV !== 'production') {
  module.exports.getPropTypes = function (ownPropKeys, propTypes) {
    return ownPropKeys.reduce(function (out, key) {
      var styleMap = propTypes[key];
      var propType = styleMap.type;

      if (propType === 'oneOf') {
        out[key] = PropTypes.oneOf(styleMap.values);
      } else if (propType === 'bool') {
        out[key] = PropTypes.bool;
      }

      return out;
    }, {
      component: PropTypes.oneOfType([PropTypes.string, PropTypes.function])
    });
  };
}
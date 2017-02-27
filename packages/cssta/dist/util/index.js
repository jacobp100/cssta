'use strict';

/* eslint-disable no-param-reassign */
var React = require('react');

var PropTypes = React.PropTypes;


var keyframesRegExp = /keyframes$/i;

module.exports.shallowEqual = function (tom, jerry) {
  if (tom === jerry) return true;

  /* eslint-disable */
  for (var key in jerry) {
    if (!(key in tom)) return false;
  }

  for (var _key in tom) {
    if (!(_key in jerry) || tom[_key] !== jerry[_key]) return false;
  }
  /* eslint-enable */

  return true;
};

module.exports.keyframesRegExp = keyframesRegExp;
module.exports.isDirectChildOfKeyframes = function (node) {
  return node.parent && node.parent.type === 'atrule' && keyframesRegExp.test(node.parent.name);
};
module.exports.varRegExp = /var\s*\(\s*--([_a-z0-9-]+)\s*(?:,\s*([^)]+))?\)/ig;
module.exports.varRegExpNonGlobal = /var\s*\(\s*--([_a-z0-9-]+)\s*(?:,\s*([^)]+))?\)/i;

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
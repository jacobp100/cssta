'use strict';

/* eslint-disable no-param-reassign */
var React = require('react');

var _require = require('../util/props'),
    getOwnPropKeys = _require.getOwnPropKeys,
    getComponentProps = _require.getComponentProps,
    getPropTypes = _require.getPropTypes;

module.exports = function (transformProps) {
  return function (component, propTypes) {
    for (var _len = arguments.length, otherParams = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      otherParams[_key - 2] = arguments[_key];
    }

    var ownPropKeys = getOwnPropKeys(propTypes);

    var StaticComponent = function StaticComponent(props) {
      var _getComponentProps = getComponentProps(ownPropKeys, component, props),
          Element = _getComponentProps.Element,
          ownProps = _getComponentProps.ownProps,
          passedProps = _getComponentProps.passedProps;

      return React.createElement(Element, transformProps.apply(undefined, [ownProps, passedProps].concat(otherParams)));
    };

    if (process.env.NODE_ENV !== 'production' && !Array.isArray(propTypes)) {
      StaticComponent.propTypes = getPropTypes(ownPropKeys, propTypes);
    }

    return StaticComponent;
  };
};
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* eslint-disable */
var _require = require('react-native'),
    StyleSheet = _require.StyleSheet,
    Easing = _require.Easing;
/* eslint-enable */


var _require2 = require('../util'),
    getAppliedRules = _require2.getAppliedRules;

module.exports.mergeStyles = function (props) {
  return StyleSheet.flatten(getAppliedRules(props.args.rules, props.ownProps).map(function (rule) {
    return rule.style;
  }));
};

module.exports.interpolateValue = function (inputRange, outputRange, animation) {
  var interpolateNumbers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  var firstValue = outputRange[0];
  if (interpolateNumbers && typeof firstValue === 'number') return animation;

  if (!Array.isArray(firstValue)) {
    return animation.interpolate({ inputRange: inputRange, outputRange: outputRange });
  }

  // transforms
  if (process.env.NODE_ENV !== 'production') {
    var currentProperties = String(firstValue.map(Object.keys));
    // Not the *best* practise here...
    var transformsAreConsistent = outputRange.every(function (range) {
      var rangeProperties = String(range.map(Object.keys));
      return currentProperties === rangeProperties;
    });

    if (!transformsAreConsistent) {
      throw new Error('Expected transforms to have same shape between transitions');
    }
  }

  return firstValue.map(function (transform, index) {
    var property = Object.keys(transform)[0];
    var innerOutputRange = outputRange.map(function (range) {
      return range[index][property];
    });

    // We *have* to interpolate even numeric values, as we will always animate between 0--1
    var interpolation = animation.interpolate({ inputRange: inputRange, outputRange: innerOutputRange });

    return _defineProperty({}, property, interpolation);
  });
};

module.exports.getDurationInMs = function (duration) {
  var time = parseFloat(duration);
  var factor = /ms$/i.test(duration) ? 1 : 1000;
  return time * factor;
};

module.exports.easingFunctions = {
  linear: Easing.linear,
  ease: Easing.ease,
  'ease-in': Easing.in,
  'ease-out': Easing.out,
  'ease-in-out': Easing.inOut
};

module.exports.durationRegExp = /^\d/;

module.exports.easingRegExp = /(linear|ease(?:-in)?(?:-out)+)/i;
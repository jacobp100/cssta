'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/* eslint-disable no-param-reassign */
var React = require('react');
/* eslint-disable */

var _require = require('react-native'),
    Animated = _require.Animated,
    Easing = _require.Easing;
/* eslint-enable */


var _require2 = require('../../util'),
    shallowEqual = _require2.shallowEqual;

var Component = React.Component;


var mergeObjectArray = function mergeObjectArray(objects) {
  return Object.assign.apply(Object, [{}].concat(_toConsumableArray(objects.filter(function (style) {
    return (typeof style === 'undefined' ? 'undefined' : _typeof(style)) === 'object';
  }))));
};

var mergeStyles = function mergeStyles(props) {
  return mergeObjectArray(props.appliedRules.map(function (rule) {
    return rule.style;
  }));
};
var mergeTransitions = function mergeTransitions(props) {
  return mergeObjectArray(props.appliedRules.map(function (rule) {
    return rule.transitions;
  }));
};

var getDurationInMs = function getDurationInMs(duration) {
  var time = parseFloat(duration);
  var factor = /ms$/i.test(duration) ? 1 : 1000;
  return time * factor;
};

var interpolateValue = function interpolateValue(currentValue, previousValue, animation) {
  if (typeof currentValue === 'number') return animation;

  if (!Array.isArray(currentValue)) {
    return animation.interpolate({
      inputRange: [0, 1],
      outputRange: [previousValue, currentValue]
    });
  }

  // transforms
  return currentValue.map(function (transform, index) {
    var previousTransform = previousValue[index];
    var property = Object.keys(transform)[0];
    console.log(property);

    if (process.env.NODE_ENV !== 'production' && !(property in previousTransform)) {
      throw new Error('Expected transforms to have same shape between transforms');
    }

    var interpolation = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [previousTransform[property], transform[property]]
    });

    return _defineProperty({}, property, interpolation);
  });
};

var easingFunctions = {
  linear: Easing.linear,
  ease: Easing.ease,
  'ease-in': Easing.in,
  'ease-out': Easing.out,
  'ease-in-out': Easing.inOut
};

module.exports = function (_Component) {
  _inherits(TransitionManager, _Component);

  function TransitionManager(props) {
    _classCallCheck(this, TransitionManager);

    var _this = _possibleConstructorReturn(this, (TransitionManager.__proto__ || Object.getPrototypeOf(TransitionManager)).call(this));

    var styles = mergeStyles(props);
    var transitions = props.managerArgs.transitions; // All transitions

    _this.state = { styles: styles, previousStyles: styles };

    _this.animationValues = transitions.reduce(function (animationValues, transitionName) {
      var targetValue = styles[transitionName];
      var initialValue = typeof targetValue === 'number' ? targetValue : 0;
      animationValues[transitionName] = new Animated.Value(initialValue);
      return animationValues;
    }, {});
    return _this;
  }

  _createClass(TransitionManager, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      var previousStyles = this.state.styles;
      var styles = mergeStyles(nextProps);
      if (!shallowEqual(previousStyles, styles)) this.setState({ styles: styles, previousStyles: previousStyles });
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      var styles = this.state.styles;


      if (prevState.styles === styles) return;

      var animationValues = this.animationValues;


      var currentTransitions = mergeTransitions(this.props);

      var animations = Object.keys(animationValues).map(function (transitionProperty) {
        var transitionValues = currentTransitions[transitionProperty] || [];

        var durationMatch = transitionValues.find(function (value) {
          return (/^\d/.test(value)
          );
        });
        var duration = durationMatch ? getDurationInMs(durationMatch) : 0;

        var easingMatch = transitionValues.find(function (value) {
          return (/^[a-z]/.test(value)
          );
        });
        var easing = easingMatch ? easingFunctions[easingMatch] : easingFunctions.linear;

        var animation = animationValues[transitionProperty];

        var targetValue = styles[transitionProperty];
        var needsInterpolation = typeof targetValue !== 'number';
        var toValue = !needsInterpolation ? targetValue : 1;

        if (needsInterpolation) animation.setValue(0);

        return Animated.timing(animation, { toValue: toValue, duration: duration, easing: easing });
      });

      Animated.parallel(animations).start();
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          NextElement = _props.NextElement,
          Element = _props.Element,
          ownProps = _props.ownProps,
          passedProps = _props.passedProps,
          managerArgs = _props.managerArgs;
      var appliedRules = this.props.appliedRules;
      var animationValues = this.animationValues;


      var animationNames = Object.keys(animationValues);
      if (animationNames.length > 0) {
        (function () {
          var _state = _this2.state,
              styles = _state.styles,
              previousStyles = _state.previousStyles;


          var fixedAnimations = animationNames.reduce(function (accum, animationName) {
            var animation = animationValues[animationName];

            accum[animationName] = interpolateValue(styles[animationName], previousStyles[animationName], animation);
            return accum;
          }, {});

          var newRule = { style: fixedAnimations };
          appliedRules = appliedRules.concat(newRule);
        })();
      }

      var nextProps = { Element: Element, ownProps: ownProps, passedProps: passedProps, appliedRules: appliedRules, managerArgs: managerArgs };
      return React.createElement(NextElement, nextProps);
    }
  }]);

  return TransitionManager;
}(Component);
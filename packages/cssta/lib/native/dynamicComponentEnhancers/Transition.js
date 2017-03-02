'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/* eslint-disable no-param-reassign */
var React = require('react');
/* eslint-disable */

var _require = require('react-native'),
    StyleSheet = _require.StyleSheet,
    Animated = _require.Animated,
    Easing = _require.Easing;
/* eslint-enable */


var _require2 = require('../util'),
    getAppliedRules = _require2.getAppliedRules;

var _require3 = require('../../util'),
    shallowEqual = _require3.shallowEqual;

var _require4 = require('./animationUtil'),
    mergeStyles = _require4.mergeStyles,
    interpolateValue = _require4.interpolateValue,
    getDurationInMs = _require4.getDurationInMs,
    easingFunctions = _require4.easingFunctions,
    durationRegExp = _require4.durationRegExp,
    easingRegExp = _require4.easingRegExp;

var Component = React.Component;


var getInitialValue = function getInitialValue(targetValue) {
  return typeof targetValue === 'number' ? targetValue : 0;
};

var mergeTransitions = function mergeTransitions(props) {
  var transitions = getAppliedRules(props.args.rules, props.ownProps).map(function (rule) {
    return rule.transitions;
  }).filter(function (transition) {
    return (typeof transition === 'undefined' ? 'undefined' : _typeof(transition)) === 'object';
  });
  return Object.assign.apply(Object, [{}].concat(_toConsumableArray(transitions)));
};

module.exports = function (_Component) {
  _inherits(TransitionEnhancer, _Component);

  function TransitionEnhancer(props) {
    _classCallCheck(this, TransitionEnhancer);

    var _this = _possibleConstructorReturn(this, (TransitionEnhancer.__proto__ || Object.getPrototypeOf(TransitionEnhancer)).call(this));

    var styles = mergeStyles(props);
    var transitionedProperties = props.args.transitionedProperties;


    _this.state = { styles: styles, previousStyles: styles };

    _this.animationValues = transitionedProperties.reduce(function (animationValues, transitionName) {
      animationValues[transitionName] = new Animated.Value(getInitialValue(styles[transitionName]));
      return animationValues;
    }, {});
    return _this;
  }

  _createClass(TransitionEnhancer, [{
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
          return durationRegExp.test(value);
        });
        var duration = durationMatch ? getDurationInMs(durationMatch) : 0;

        var easingMatch = transitionValues.find(function (value) {
          return easingRegExp.test(value);
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
      var _props = this.props,
          args = _props.args,
          children = _props.children;
      var animationValues = this.animationValues;


      var animationNames = Object.keys(animationValues);

      var nextProps = void 0;
      if (animationNames.length > 0) {
        var _state = this.state,
            styles = _state.styles,
            previousStyles = _state.previousStyles;


        var fixedAnimations = animationNames.reduce(function (accum, animationName) {
          accum[animationName] = interpolateValue([0, 1], [previousStyles[animationName], styles[animationName]], animationValues[animationName], true /* interpolate numbers */
          );
          return accum;
        }, {});

        var newRule = { style: fixedAnimations };
        var nextArgs = Object.assign({}, args, { rules: args.rules.concat(newRule) });
        nextProps = Object.assign({}, this.props, { args: nextArgs });
      } else {
        nextProps = this.props;
      }

      return children(nextProps);
    }
  }]);

  return TransitionEnhancer;
}(Component);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

var _require3 = require('./animationUtil'),
    mergeStyles = _require3.mergeStyles,
    interpolateValue = _require3.interpolateValue,
    getDurationInMs = _require3.getDurationInMs,
    easingFunctions = _require3.easingFunctions,
    durationRegExp = _require3.durationRegExp,
    easingRegExp = _require3.easingRegExp;

var Component = React.Component;


var getAnimation = function getAnimation(props) {
  var animations = getAppliedRules(props.args.rules, props.ownProps).map(function (rule) {
    return rule.animation;
  }).filter(function (animation) {
    return animation !== null;
  });
  return animations.length ? animations[animations.length - 1] : null;
};

var getKeyframe = function getKeyframe(animationValues) {
  return animationValues.find(function (value) {
    return !durationRegExp.test(value) && !easingRegExp.test(value);
  });
};

var noAnimations = { duration: null, easing: null, animations: null, animationValues: null };

var getAnimationState = function getAnimationState(props) {
  var currentStyles = mergeStyles(props);

  var currentAnimationValues = getAnimation(props) || [];
  var keyframe = getKeyframe(currentAnimationValues);

  var animationSequence = keyframe ? props.args.keyframes[keyframe] : null;

  if (!animationSequence) return noAnimations;

  var durationMatch = currentAnimationValues.find(function (value) {
    return durationRegExp.test(value);
  });
  var duration = durationMatch ? getDurationInMs(durationMatch) : 0;

  var easingMatch = currentAnimationValues.find(function (value) {
    return easingRegExp.test(value);
  });
  var easing = easingMatch ? easingFunctions[easingMatch] : easingFunctions.linear;

  var animatedProperties = Object.keys(Object.assign.apply(Object, [{}].concat(_toConsumableArray(animationSequence.map(function (frame) {
    return frame.styles;
  })))));

  var animationValues = animatedProperties.reduce(function (accum, animationProperty) {
    accum[animationProperty] = new Animated.Value(0);
    return accum;
  }, {});

  var animations = animatedProperties.reduce(function (accum, animationProperty) {
    var currentValue = currentStyles[animationProperty];

    var keyframes = animationSequence.filter(function (frame) {
      return animationProperty in frame.styles;
    }).map(function (_ref) {
      var time = _ref.time,
          styles = _ref.styles;
      return { time: time, value: styles[animationProperty] };
    });
    // Fixes missing start/end values
    keyframes = [].concat(keyframes[0].time > 0 ? [{ time: 0, value: currentValue }] : [], keyframes, keyframes[keyframes.length - 1].time < 1 ? [{ time: 1, value: currentValue }] : []);

    var inputRange = keyframes.map(function (frame) {
      return frame.time;
    });
    var outputRange = keyframes.map(function (frame) {
      return frame.value;
    });
    var animation = animationValues[animationProperty];
    accum[animationProperty] = interpolateValue(inputRange, outputRange, animation);
    return accum;
  }, {});

  return { duration: duration, easing: easing, animations: animations, animationValues: animationValues };
};

module.exports = function (_Component) {
  _inherits(AnimationEnhancer, _Component);

  function AnimationEnhancer(props) {
    _classCallCheck(this, AnimationEnhancer);

    var _this = _possibleConstructorReturn(this, (AnimationEnhancer.__proto__ || Object.getPrototypeOf(AnimationEnhancer)).call(this));

    _this.state = getAnimationState(props);
    return _this;
  }

  _createClass(AnimationEnhancer, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.runAnimation();
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      var nextAnimationValues = getAnimation(nextProps) || [];
      var currentAnimationValues = getAnimation(this.props) || [];

      if (getKeyframe(nextAnimationValues) !== getKeyframe(currentAnimationValues)) {
        this.setState(getAnimationState(nextProps));
      }
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      if (this.state.animationValues !== prevState.animationValues) this.runAnimation();
    }
  }, {
    key: 'runAnimation',
    value: function runAnimation() {
      var _this2 = this;

      var _state = this.state,
          duration = _state.duration,
          easing = _state.easing,
          animationValuesObject = _state.animationValues;


      if (!animationValuesObject) return;

      var animationValues = Object.values(animationValuesObject);

      animationValues.forEach(function (animation) {
        return animation.setValue(0);
      });

      var timings = animationValues.map(function (animation) {
        return Animated.timing(animation, { toValue: 1, duration: duration, easing: easing });
      });

      Animated.parallel(timings).start(function (_ref2) {
        var finished = _ref2.finished;

        // FIXME: This doesn't seem to clear the animation
        if (finished) _this2.setState(noAnimations);
      });
    }
  }, {
    key: 'animate',
    value: function animate() {
      // How do we expose this to the user?
      this.setState(getAnimationState(this.props));
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          args = _props.args,
          children = _props.children;
      var animations = this.state.animations;


      var nextProps = void 0;
      if (animations) {
        var newRule = { style: animations };
        var nextArgs = Object.assign({}, args, { rules: args.rules.concat(newRule) });
        nextProps = Object.assign({}, this.props, { args: nextArgs });
      } else {
        nextProps = this.props;
      }

      return children(nextProps);
    }
  }]);

  return AnimationEnhancer;
}(Component);
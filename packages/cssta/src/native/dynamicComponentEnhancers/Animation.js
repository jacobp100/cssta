/* eslint-disable no-param-reassign */
const React = require('react');
/* eslint-disable */
const { StyleSheet, Animated, Easing } = require('react-native');
/* eslint-enable */
const { getAppliedRules } = require('../util');
const {
  mergeStyles, interpolateValue, getDurationInMs, easingFunctions, durationRegExp, easingRegExp,
} = require('./animationUtil');

const { Component } = React;

const getAnimation = (props) => {
  const animations = getAppliedRules(props.args.rules, props.ownProps)
    .map(rule => rule.animation)
    .filter(animation => animation !== null);
  return animations.length ? animations[animations.length - 1] : null;
};

const getKeyframe = animationValues => animationValues
    .find(value => !durationRegExp.test(value) && !easingRegExp.test(value));

const getAnimationState = (props) => {
  const currentStyles = mergeStyles(props);

  const currentAnimationValues = getAnimation(props) || [];

  const durationMatch = currentAnimationValues.find(value => durationRegExp.test(value));
  const duration = durationMatch ? getDurationInMs(durationMatch) : 0;

  const easingMatch = currentAnimationValues.find(value => easingRegExp.test(value));
  const easing = easingMatch ? easingFunctions[easingMatch] : easingFunctions.linear;

  const keyframe = getKeyframe(currentAnimationValues);

  const animationSequence = keyframe ? props.args.keyframes[keyframe] : [];
  const animatedProperties =
    Object.keys(Object.assign({}, ...animationSequence.map(frame => frame.styles)));

  const animationValues = animatedProperties.reduce((accum, animationProperty) => {
    accum[animationProperty] = new Animated.Value(0);
    return accum;
  }, {});

  const animations = animatedProperties.reduce((accum, animationProperty) => {
    const currentValue = currentStyles[animationProperty];

    let keyframes = animationSequence
      .filter(frame => animationProperty in frame.styles)
      .map(({ time, styles }) => ({ time, value: styles[animationProperty] }));
    // Fixes missing start/end values
    keyframes = [].concat(
      (keyframes[0].time > 0) ? [{ time: 0, value: currentValue }] : [],
      keyframes,
      (keyframes[keyframes.length - 1].time < 1) ? [{ time: 1, value: currentValue }] : []
    );

    const inputRange = keyframes.map(frame => frame.time);
    const outputRange = keyframes.map(frame => frame.value);
    const animation = animationValues[animationProperty];
    accum[animationProperty] = interpolateValue(inputRange, outputRange, animation);
    return accum;
  }, {});

  return { duration, easing, animations, animationValues };
};

module.exports = class AnimationEnhancer extends Component {
  constructor(props) {
    super();

    this.state = getAnimationState(props);
  }

  componentDidMount() {
    this.runAnimation();
  }

  componentWillReceiveProps(nextProps) {
    const nextAnimationValues = getAnimation(nextProps) || [];
    const currentAnimationValues = getAnimation(this.props) || [];

    if (getKeyframe(nextAnimationValues) !== getKeyframe(currentAnimationValues)) {
      this.setState(getAnimationState(nextProps));
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.animations !== prevState.animations) this.runAnimation();
  }

  runAnimation() {
    const { duration, easing, animationValues: animationValuesObject } = this.state;
    const animationValues = Object.values(animationValuesObject);

    animationValues.forEach(animation => animation.setValue(0));

    const timings = animationValues
      .map(animation => Animated.timing(animation, { toValue: 1, duration, easing }));

    Animated.parallel(timings).start();
  }

  animate() {
    // How do we expose this to the user?
    this.setState(getAnimationState(this.props));
  }

  render() {
    const { args, children } = this.props;
    const { animations } = this.state;

    const newRule = { style: animations };
    const nextArgs = Object.assign({}, args, { rules: args.rules.concat(newRule) });
    const nextProps = Object.assign({}, this.props, { args: nextArgs });
    return children(nextProps);
  }
};

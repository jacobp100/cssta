/* eslint-disable no-param-reassign */
const React = require('react');
/* eslint-disable */
const { StyleSheet, Animated, Easing } = require('react-native');
/* eslint-enable */
const { getAppliedRules } = require('../util');
const { shallowEqual } = require('../../util');
const {
  mergeStyles, interpolateValue, getInitialValue, getDurationInMs,
} = require('./animationUtil');

const { Component } = React;

const getAnimation = (props) => {
  const animations = getAppliedRules(props.args.rules, props.ownProps)
    .map(rule => rule.animation)
    .filter(animation => animation !== null);
  return animations.length ? animations[animations.length - 1] : null;
};

module.exports = class TransitionEnhancer extends Component {
  constructor(props) {
    super();

    const styles = mergeStyles(props);
    const { animatedProperties } = props.args;

    this.animationValues = animatedProperties.reduce((animationValues, transitionName) => {
      animationValues[transitionName] = new Animated.Value(getInitialValue(styles[transitionName]));
      return animationValues;
    }, {});

    this.state = this.getActiveAnimations(props);
  }

  componentDidMount() {
    this.runAnimation(this.state);
  }

  getActiveAnimations(props) {
    const styles = mergeStyles(props);

    const { animationValues } = this;

    const currentAnimation = getAnimation(props); // FIXME: Get keyframes
    const animatedProperties = currentAnimation
      ? this.props.args.keyframes[currentAnimation]
      : {};

    const duration = 1000;
    const easing = Easing.linear;

    const activeAnimations = Object.keys(animatedProperties).reduce((accum, animationProperty) => {
      let keyframes = animatedProperties[animationProperty];
      if (keyframes[0].time !== 0) {
        keyframes = [{ time: 0, value: styles[animationProperty] }].concat(keyframes);
      }
      if (keyframes[keyframes.length - 1].time !== 0) {
        keyframes = keyframes.concat({ time: 1, value: styles[animationProperty] });
      }
      const inputRange = keyframes.map(keyframe => keyframe.time);
      const outputRange = keyframes.map(keyframe => keyframe.value);
      accum[animationProperty] = animationValues.interpolate({ inputRange, outputRange });
      return accum;
    });

    return { duration, easing, activeAnimations };
  }

  runAnimation({ duration, easing, activeAnimations }) {
    const { animationValues } = this;

    const animations = Object.keys(activeAnimations).map(animationProperty => (
      Animated.timing(animationValues[animationProperty], { toValue: 1, duration, easing })
    ));

    Animated.parallel(animations).start();
  }

  animate() {
    const nextState = this.getActiveAnimations(this.props);
    this.setState(nextState, () => {
      this.runAnimation(nextState);
    });
  }

  render() {
    const { args, children } = this.props;
    const { activeAnimations } = this.state;

    const newRule = { style: activeAnimations };
    const nextArgs = Object.assign({}, args, { rules: args.rules.concat(newRule) });
    const nextProps = Object.assign({}, this.props, { args: nextArgs });
    return children(nextProps);
  }
};

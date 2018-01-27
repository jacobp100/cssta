// @flow
/*
CAUTION!

This file could be included even after running the babel plugin.

Make sure you don't import large libraries.
*/
const React = require("react");
/* eslint-disable */
// $FlowFixMe
const { StyleSheet, Animated, Easing } = require("react-native");
/* eslint-enable */
const { getAppliedRules } = require("../util");
const {
  mergeStyles,
  interpolateValue,
  getDurationInMs,
  easingFunctions,
  durationRegExp,
  easingRegExp
} = require("./animationUtil");
/*:: import type { DynamicProps } from '../../factories/types' */
/*:: import type { Args } from '../types' */
/*:: import type { OutputRange, InterpolatedValue } from './animationUtil' */

const { Component } = React;

const getAnimation = props => {
  const animations = getAppliedRules(props.args.rules, props.ownProps)
    .map(rule => rule.animation)
    .filter(animation => animation !== null);
  return animations.length ? animations[animations.length - 1] : null;
};

const getKeyframe = animationValues =>
  animationValues.find(
    value => !durationRegExp.test(value) && !easingRegExp.test(value)
  );

const noAnimations = {
  duration: null,
  easing: null,
  animations: null,
  animationValues: null
};

const getAnimationState = props => {
  const currentStyles = mergeStyles(props);

  const currentAnimationValues = getAnimation(props) || [];
  const keyframe = getKeyframe(currentAnimationValues);

  const animationSequence = keyframe ? props.args.keyframes[keyframe] : null;

  if (!animationSequence) return noAnimations;

  const durationMatch = currentAnimationValues.find(value =>
    durationRegExp.test(value)
  );
  const duration = durationMatch ? getDurationInMs(durationMatch) : 0;

  const easingMatch = currentAnimationValues.find(value =>
    easingRegExp.test(value)
  );
  const easing = easingMatch
    ? easingFunctions[easingMatch]
    : easingFunctions.linear;

  const animatedProperties = Object.keys(
    Object.assign({}, ...animationSequence.map(frame => frame.styles))
  );

  const animationValues = animatedProperties.reduce(
    (accum, animationProperty) => {
      /* eslint-disable no-param-reassign */
      accum[animationProperty] = new Animated.Value(0);
      return accum;
    },
    {}
  );

  const animations = animatedProperties.reduce((accum, animationProperty) => {
    const currentValue = currentStyles[animationProperty];

    let keyframes = animationSequence
      .filter(frame => animationProperty in frame.styles)
      .map(({ time, styles }) => ({ time, value: styles[animationProperty] }));
    // Fixes missing start/end values
    keyframes = [].concat(
      keyframes[0].time > 0 ? [{ time: 0, value: currentValue }] : [],
      keyframes,
      keyframes[keyframes.length - 1].time < 1
        ? [{ time: 1, value: currentValue }]
        : []
    );

    const inputRange = keyframes.map(frame => frame.time);
    const outputRange /*: OutputRange */ = keyframes.map(frame => frame.value);
    const animation = animationValues[animationProperty];
    accum[animationProperty] = interpolateValue(
      inputRange,
      outputRange,
      animation
    );
    return accum;
  }, {});

  return { duration, easing, animations, animationValues };
};

/*::
type AnimatedValue = {
  setValue: (value: number) => void,
}

type AnimationState = {
  duration: ?number,
  easing: ?any,
  animations: ?{ [key:string]: InterpolatedValue },
  animationValues: ?{ [key:string]: AnimatedValue },
}
*/

module.exports = class AnimationEnhancer extends Component /*::<
  DynamicProps<Args>,
  AnimationState
>*/ {
  constructor(props /*: DynamicProps<Args> */) {
    super();

    this.state = getAnimationState(props);
  }

  componentDidMount() {
    this.runAnimation();
  }

  componentWillReceiveProps(nextProps /*: DynamicProps<Args> */) {
    const nextAnimationValues = getAnimation(nextProps) || [];
    const currentAnimationValues = getAnimation(this.props) || [];

    if (
      getKeyframe(nextAnimationValues) !== getKeyframe(currentAnimationValues)
    ) {
      this.setState(getAnimationState(nextProps));
    }
  }

  componentDidUpdate(
    prevProps /*: DynamicProps<Args> */,
    prevState /*: AnimationState */
  ) {
    if (this.state.animationValues !== prevState.animationValues)
      this.runAnimation();
  }

  runAnimation() {
    const {
      duration,
      easing,
      animationValues: animationValuesObject
    } = this.state;

    if (!animationValuesObject) return;

    // $FlowFixMe
    const animationValues /*: AnimatedValue[] */ = Object.values(
      animationValuesObject
    );

    animationValues.forEach(animation => animation.setValue(0));

    const timings = animationValues.map(animation =>
      Animated.timing(animation, { toValue: 1, duration, easing })
    );

    Animated.parallel(timings).start(({ finished }) => {
      // FIXME: This doesn't seem to clear the animation
      if (finished) this.setState(noAnimations);
    });
  }
  animate() {
    // How do we expose this to the user?
    this.setState(getAnimationState(this.props));
  }

  render() {
    const { args, children } = this.props;
    const { animations } = this.state;

    let nextProps;
    if (animations) {
      const newRule = { style: animations };
      const { transitionedProperties, keyframes, rules } = args;
      const nextArgs = {
        transitionedProperties,
        keyframes,
        rules: rules.concat(newRule)
      };
      nextProps = Object.assign({}, this.props, { args: nextArgs });
    } else {
      nextProps = this.props;
    }

    return children(nextProps);
  }
};

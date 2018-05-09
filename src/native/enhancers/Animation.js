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
  mergeShorthandProps,
  mergeStyles,
  interpolateValue,
  getDurationInMs,
  getIterationCount,
  easingFunctions,
  durationRegExp,
  easingRegExp,
  iterationCountRegExp
} = require("./animationUtil");
/*:: import type { DynamicProps } from '../../factories/types' */
/*:: import type { Args } from '../types' */
/*:: import type { OutputRange, InterpolatedValue } from './animationUtil' */

const { Component } = React;

/*::
type AnimatedValue = {
  setValue: (value: number) => void,
}

type AnimationState = {
  animations: ?{ [key:string]: InterpolatedValue },
  animationValues: ?{ [key:string]: AnimatedValue },
  delay: number,
  duration: number,
  iterations: number,
  name: ?string,
  easing: any,
}
*/

/* eslint-disable no-bitwise, no-param-reassign */
const TIMING_FUNCTION = 1 << 0;
const DURATION = 1 << 1;
const DELAY = 1 << 2;
const ITERATION_COUNT = 1 << 3;
const NAME = 1 << 4;

const getAnimationShorthand = shorthandParts => {
  let set = 0;
  return shorthandParts.reduce(
    (accum, part) => {
      if (!(set & TIMING_FUNCTION) && easingRegExp.test(part)) {
        accum.timingFunction = part;
        set &= TIMING_FUNCTION;
      } else if (!(set & DURATION) && durationRegExp.test(part)) {
        accum.duration = part;
        set &= DURATION;
      } else if (!(set & DELAY) && durationRegExp.test(part)) {
        accum.delay = part;
        set &= DURATION;
      } else if (!(set & ITERATION_COUNT) && iterationCountRegExp.test(part)) {
        accum.iterationCount = part;
        set &= ITERATION_COUNT;
      } else if (!(set & NAME)) {
        accum.name = part;
        set &= NAME;
      } else {
        throw new Error("Failed to parse shorthand");
      }
      return accum;
    },
    {
      delay: "0",
      duration: "0",
      iterationCount: "1",
      name: "none",
      timingFunction: "ease"
    }
  );
};
/* eslint-enable */

const getAnimations = props =>
  mergeShorthandProps(
    getAnimationShorthand,
    {
      delay: [],
      duration: [],
      iterationCount: [],
      name: [],
      timingFunction: []
    },
    getAppliedRules(props.args.rules, props.ownProps).map(
      rule => rule.animations
    )
  );

const noAnimations /*: AnimationState */ = {
  animations: null,
  animationValues: null,
  delay: 0,
  duration: 0,
  iterations: 1,
  name: null,
  easing: easingFunctions.ease
};

const getAnimationParameters = props => {
  const animations = getAnimations(props);

  if (animations.name.length === 0) {
    return {
      delay: noAnimations.delay,
      duration: noAnimations.duration,
      iterations: noAnimations.iterations,
      name: noAnimations.name,
      easing: noAnimations.easing
    };
  }

  const delay = getDurationInMs(animations.delay[0]);
  const duration = getDurationInMs(animations.duration[0]);
  const iterations = getIterationCount(animations.iterationCount[0]);
  const name = animations.name[0] !== "none" ? animations.name[0] : null;
  const timingFunction =
    animations.timingFunction.length > 0
      ? animations.timingFunction[0].toLowerCase()
      : "ease";
  const easing = easingFunctions[timingFunction];
  return { delay, duration, iterations, name, easing };
};

const getAnimationState = (
  props,
  { delay, duration, iterations, name, easing }
) => {
  const currentStyles = mergeStyles(props);

  const animationSequence = name != null ? props.args.keyframes[name] : null;
  if (animationSequence == null) return noAnimations;

  const animatedProperties = Object.keys(
    Object.assign({}, ...animationSequence.map(frame => frame.style))
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
      .filter(frame => animationProperty in frame.style)
      .map(({ time, style }) => ({ time, value: style[animationProperty] }));
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

  return {
    animations,
    animationValues,
    delay,
    duration,
    iterations,
    name,
    easing
  };
};

module.exports = class AnimationEnhancer extends Component /*::<
  DynamicProps<Args>,
  AnimationState
>*/ {
  constructor(props /*: DynamicProps<Args> */) {
    super();

    this.state = getAnimationState(props, getAnimationParameters(props));
  }

  componentDidMount() {
    this.animate();
  }

  componentWillReceiveProps(nextProps /*: DynamicProps<Args> */) {
    const nextAnimationParameters = getAnimationParameters(nextProps);

    if (this.state.name !== nextAnimationParameters.name) {
      this.setState(getAnimationState(nextProps, nextAnimationParameters));
    }
  }

  componentDidUpdate(
    prevProps /*: DynamicProps<Args> */,
    prevState /*: AnimationState */
  ) {
    if (this.state.name !== prevState.name) this.animate();
  }

  animate() {
    const {
      delay,
      duration,
      iterations,
      easing,
      animationValues: animationValuesObject
    } = this.state;

    if (!animationValuesObject) return;

    // $FlowFixMe
    const animationValues /*: AnimatedValue[] */ = Object.values(
      animationValuesObject
    );

    animationValues.forEach(animation => animation.setValue(0));

    const timings = animationValues.map(animation => {
      const config = { toValue: 1, duration, delay, easing };
      let res = Animated.sequence([
        Animated.timing(animation, config),
        // Reset animation
        Animated.timing(animation, { toValue: 0, duration: 0 })
      ]);

      if (iterations !== 1) {
        res = Animated.loop(res, { iterations });
      }

      return res;
    });

    Animated.parallel(timings).start(({ finished }) => {
      // FIXME: This doesn't seem to clear the animation
      if (finished) {
        this.setState({
          animations: null,
          animationValues: null
        });
      }
    });
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

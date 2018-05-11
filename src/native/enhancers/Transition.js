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
  easingFunctions,
  durationRegExp,
  easingRegExp
} = require("./animationUtil");
/*:: import type { DynamicProps } from '../../factories/types' */
/*:: import type { Args, TransitionParts } from '../types' */
/*:: import type { Interpolation } from './animationUtil' */

const { Component } = React;

const getInitialValue = targetValue =>
  typeof targetValue === "number" ? targetValue : 0;

/* eslint-disable no-param-reassign, no-restricted-syntax */
const shallowEqual = (
  tom /*: Object */,
  jerry /*: Object */
) /*: boolean */ => {
  if (tom === jerry) return true;

  for (const key in jerry) {
    if (!(key in tom)) return false;
  }

  for (const key in tom) {
    if (!(key in jerry) || tom[key] !== jerry[key]) return false;
  }

  return true;
};
/* eslint-enable */

/* eslint-disable no-bitwise, no-param-reassign */
const DELAY = 1;
const DURATION = 1 << 1;
const TIMING_FUNCTION = 1 << 2;

const getTransitionShorthand = shorthandParts => {
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
      } else {
        throw new Error("Failed to parse shorthand");
      }
      return accum;
    },
    { delay: "0", duration: "0", timingFunction: "ease" }
  );
};
/* eslint-enable */

const getTransitions = props =>
  mergeShorthandProps(
    getTransitionShorthand,
    { property: [], delay: [], duration: [], timingFunction: [] },
    getAppliedRules(props.args.rules, props.ownProps).map(
      rule => rule.transitions
    )
  );

/*::
type AnimatedValue = {
  setValue: (value: number) => void,
}

type TransitionState = {
  styles: { [key:string]: Interpolation },
  previousStyles: { [key:string]: Interpolation },
}
*/

module.exports = class TransitionEnhancer extends Component /*::<
  DynamicProps<Args>,
  TransitionState
>*/ {
  /*:: animationValues: { [key:string]: AnimatedValue } */

  constructor(props /*: DynamicProps<Args> */) {
    super();

    const styles = mergeStyles(props);

    this.state = { styles, previousStyles: styles };

    this.animationValues = props.args.transitionedProperties.reduce(
      (animationValues, transitionName) => {
        /* eslint-disable no-param-reassign */
        animationValues[transitionName] = new Animated.Value(
          getInitialValue(styles[transitionName])
        );
        return animationValues;
      },
      {}
    );
  }

  componentWillReceiveProps(nextProps /*: DynamicProps<Args> */) {
    const previousStyles = this.state.styles;
    const styles = mergeStyles(nextProps);
    if (!shallowEqual(previousStyles, styles)) {
      this.setState({ styles, previousStyles });
    }
  }

  componentDidUpdate(
    prevProps /*: DynamicProps<Args> */,
    prevState /*: TransitionState */
  ) {
    const { styles } = this.state;

    if (prevState.styles === styles) return;

    const { animationValues, props } = this;

    const transitions = getTransitions(props);
    const delays = transitions.delay.map(getDurationInMs);
    const durations = transitions.duration.map(getDurationInMs);
    const easings = transitions.timingFunction.map(
      s => easingFunctions[s.toLowerCase()]
    );
    const animations = transitions.property.map((p, index) => {
      const animation = animationValues[p];
      // Per spec, cycle through multiple values if transition-property length exceeds
      // the length of the other property
      const delay = delays[index % delays.length];
      const duration = durations[index % durations.length];
      const easing = easings[index % easings.length];

      const targetValue = styles[p];
      const needsInterpolation = typeof targetValue !== "number";
      const toValue = !needsInterpolation ? targetValue : 1;

      if (needsInterpolation) animation.setValue(0);

      return Animated.timing(animation, { toValue, duration, delay, easing });
    });

    // Set non-transitioned properties to their values
    Object.keys(this.animationValues).forEach(p => {
      if (!transitions.property.includes(p)) {
        const animation = animationValues[p];
        const targetValue = styles[p];
        const toValue = typeof targetValue === "number" ? targetValue : 1;
        animation.setValue(toValue);
      }
    });

    Animated.parallel(animations).start();
  }

  render() {
    const { args, children } = this.props;
    const { animationValues } = this;

    const animationNames = Object.keys(animationValues);

    let nextProps;
    if (animationNames.length > 0) {
      const { styles, previousStyles } = this.state;

      /* eslint-disable no-param-reassign */
      const fixedAnimations = animationNames.reduce((accum, animationName) => {
        accum[animationName] = interpolateValue(
          [0, 1],
          [previousStyles[animationName], styles[animationName]],
          animationValues[animationName],
          true /* interpolate numbers */
        );
        return accum;
      }, {});
      /* eslint-enable */

      const newRule = { style: fixedAnimations };
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

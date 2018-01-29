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
const { shallowEqual } = require("../../util");
const {
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

/* eslint-disable no-bitwise, no-param-reassign */
const DELAY = 1;
const DURATION = 1 << 1;
const TIMING_FUNCTION = 1 << 2;

const getTransitionShorthand = shorthandParts =>
  shorthandParts.reduce(
    (accum, part) => {
      if (!(accum.set & TIMING_FUNCTION) && easingRegExp.test(part)) {
        accum.timingFunction = part;
        accum.set &= TIMING_FUNCTION;
      } else if (!(accum.set & DURATION) && durationRegExp.test(part)) {
        accum.duration = part;
        accum.set &= DURATION;
      } else if (!(accum.set & DELAY) && durationRegExp.test(part)) {
        accum.delay = part;
        accum.set &= DURATION;
      } else {
        throw new Error("Failed to parse shorthand");
      }
      return accum;
    },
    { delay: "0", duration: "0", timingFunction: "ease", set: 0 }
  );

const separator = /\s*,\s*/;

const transformAttributes = (accum, attr) => {
  Object.keys(attr).forEach(key => {
    if (attr[key] != null) accum.attributes[key] = attr[key].split(separator);
  });
};

const getTransitions = props =>
  getAppliedRules(props.args.rules, props.ownProps).reduce(
    (accum, { transitions }) => {
      if (transitions == null) return accum;
      const { property, shorthand, attributes } = transitions;

      if (property != null) accum.property = property;

      if (shorthand) {
        accum.attributes.delay.length = 0;
        accum.attributes.duration.length = 0;
        accum.attributes.timingFunction.length = 0;
        shorthand.forEach(s => {
          const parts = getTransitionShorthand(s);
          accum.attributes.delay.push(parts.delay);
          accum.attributes.duration.push(parts.duration);
          accum.attributes.timingFunction.push(parts.timingFunction);
        });
      }

      transformAttributes(accum, attributes);

      return accum;
    },
    {
      property: [],
      attributes: { delay: [], duration: [], timingFunction: [] }
    }
  );
/* eslint-enable */

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

    const animationValues = {};
    props.args.rules.forEach(({ transitions }) => {
      if (transitions == null || transitions.property == null) return;
      transitions.property.forEach(transitionName => {
        if (animationValues[transitionName] != null) return;
        const initialValue = getInitialValue(styles[transitionName]);
        animationValues[transitionName] = new Animated.Value(initialValue);
      });
    });
    this.animationValues = animationValues;
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

    const { property, attributes } = getTransitions(props);
    const delays = attributes.delay.map(getDurationInMs);
    const durations = attributes.duration.map(getDurationInMs);
    const easings = attributes.timingFunction.map(
      s => easingFunctions[s.toLowerCase()]
    );
    const animations = property.map((p, index) => {
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

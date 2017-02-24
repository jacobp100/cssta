/* eslint-disable no-param-reassign */
const React = require('react');
/* eslint-disable */
const { Animated, Easing } = require('react-native');
/* eslint-enable */
const { shallowEqual } = require('../../util');

const { Component } = React;

const mergeObjectArray = objects =>
  Object.assign({}, ...objects.filter(style => typeof style === 'object'));

const mergeStyles = props =>
  mergeObjectArray(props.appliedRules.map(rule => rule.style));
const mergeTransitions = props =>
  mergeObjectArray(props.appliedRules.map(rule => rule.transitions));

const getDurationInMs = (duration) => {
  const time = parseFloat(duration);
  const factor = /ms$/i.test(duration) ? 1 : 1000;
  return time * factor;
};

const interpolateValue = (currentValue, previousValue, animation) => {
  if (typeof currentValue === 'number') return animation;

  if (!Array.isArray(currentValue)) {
    return animation.interpolate({
      inputRange: [0, 1],
      outputRange: [previousValue, currentValue],
    });
  }

  // transforms
  return currentValue.map((transform, index) => {
    const previousTransform = previousValue[index];
    const property = Object.keys(transform)[0];
    console.log(property);

    if (process.env.NODE_ENV !== 'production' && !(property in previousTransform)) {
      throw new Error('Expected transforms to have same shape between transforms');
    }

    const interpolation = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [previousTransform[property], transform[property]],
    });

    return { [property]: interpolation };
  });
};

const easingFunctions = {
  linear: Easing.linear,
  ease: Easing.ease,
  'ease-in': Easing.in,
  'ease-out': Easing.out,
  'ease-in-out': Easing.inOut,
};

module.exports = class TransitionManager extends Component {
  constructor(props) {
    super();

    const styles = mergeStyles(props);
    const { transitions } = props.managerArgs; // All transitions

    this.state = { styles, previousStyles: styles };

    this.animationValues = transitions.reduce((animationValues, transitionName) => {
      const targetValue = styles[transitionName];
      const initialValue = typeof targetValue === 'number' ? targetValue : 0;
      animationValues[transitionName] = new Animated.Value(initialValue);
      return animationValues;
    }, {});
  }

  componentWillReceiveProps(nextProps) {
    const previousStyles = this.state.styles;
    const styles = mergeStyles(nextProps);
    if (!shallowEqual(previousStyles, styles)) this.setState({ styles, previousStyles });
  }

  componentDidUpdate(prevProps, prevState) {
    const { styles } = this.state;

    if (prevState.styles === styles) return;

    const { animationValues } = this;

    const currentTransitions = mergeTransitions(this.props);

    const animations = Object.keys(animationValues).map((transitionProperty) => {
      const transitionValues = currentTransitions[transitionProperty] || [];

      const durationMatch = transitionValues.find(value => /^\d/.test(value));
      const duration = durationMatch ? getDurationInMs(durationMatch) : 0;

      const easingMatch = transitionValues.find(value => /^[a-z]/.test(value));
      const easing = easingMatch ? easingFunctions[easingMatch] : easingFunctions.linear;

      const animation = animationValues[transitionProperty];

      const targetValue = styles[transitionProperty];
      const needsInterpolation = typeof targetValue !== 'number';
      const toValue = !needsInterpolation ? targetValue : 1;

      if (needsInterpolation) animation.setValue(0);

      return Animated.timing(animation, { toValue, duration, easing });
    });

    Animated.parallel(animations).start();
  }

  render() {
    const { NextElement, Element, ownProps, passedProps, managerArgs } = this.props;
    let { appliedRules } = this.props;
    const { animationValues } = this;

    const animationNames = Object.keys(animationValues);
    if (animationNames.length > 0) {
      const { styles, previousStyles } = this.state;

      const fixedAnimations = animationNames.reduce((accum, animationName) => {
        const animation = animationValues[animationName];

        accum[animationName] = interpolateValue(
          styles[animationName],
          previousStyles[animationName],
          animation
        );
        return accum;
      }, {});

      const newRule = { style: fixedAnimations };
      appliedRules = appliedRules.concat(newRule);
    }

    const nextProps = { Element, ownProps, passedProps, appliedRules, managerArgs };
    return React.createElement(NextElement, nextProps);
  }
};

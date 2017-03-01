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

const mergeTransitions = (props) => {
  const transitions = getAppliedRules(props.args.rules, props.ownProps)
    .map(rule => rule.transitions)
    .filter(transition => typeof transition === 'object');
  return Object.assign({}, ...transitions);
};

const easingFunctions = {
  linear: Easing.linear,
  ease: Easing.ease,
  'ease-in': Easing.in,
  'ease-out': Easing.out,
  'ease-in-out': Easing.inOut,
};

module.exports = class TransitionEnhancer extends Component {
  constructor(props) {
    super();

    const styles = mergeStyles(props);
    const { transitionedProperties } = props.args;

    this.state = { styles, previousStyles: styles };

    this.animationValues = transitionedProperties.reduce((animationValues, transitionName) => {
      animationValues[transitionName] = new Animated.Value(getInitialValue(styles[transitionName]));
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
    const { args, children } = this.props;
    const { animationValues } = this;

    const animationNames = Object.keys(animationValues);

    let nextProps;
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
      const nextArgs = Object.assign({}, args, { rules: args.rules.concat(newRule) });
      nextProps = Object.assign({}, this.props, { args: nextArgs });
    } else {
      nextProps = this.props;
    }

    return children(nextProps);
  }
};

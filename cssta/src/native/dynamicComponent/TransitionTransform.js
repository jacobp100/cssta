/* eslint-disable no-param-reassign */
const React = require('react');
/* eslint-disable */
const { Animated, Easing } = require('react-native');
/* eslint-enable */

const { Component } = React;

const mergeObjectArray = objects =>
  Object.assign({}, ...objects.filter(style => typeof style === 'object'));

const mergeStyles = props =>
  mergeObjectArray(props.appliedRules.map(rule => rule.style));
const mergeTransitions = props =>
  mergeObjectArray(props.appliedRules.map(rule => rule.transitions));

const getDurationInMs = (duration) => {
  const time = parseFloat(duration);
  const factor = /ms$/i.test(duration) !== -1 ? 1 : 1000;
  return time * factor;
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

    this.animationValues = transitions.reduce((animationValues, transitionName) => {
      animationValues[transitionName] = new Animated.Value(styles[transitionName]);
      return animationValues;
    }, {});
  }

  componentDidUpdate() {
    const styles = mergeStyles(this.props);
    const currentTransitions = mergeTransitions(this.props);

    const animations = Object.keys(this.animationValues).map((transitionProperty) => {
      const transitionValue = currentTransitions[transitionProperty] || '';

      const durationMatch = transitionValue.match(/\b\d+m?s\b/i); // FIXME: Decimal points
      const duration = durationMatch ? getDurationInMs(durationMatch[0]) : 0;

      const easingMatch = transitionValue.match(/\b\b[a-z][a-z-]+\b/i);
      const easing = easingMatch ? easingFunctions[easingMatch[0]] : easingFunctions.linear;

      return Animated.timing(this.animationValues[transitionProperty], {
        toValue: styles[transitionProperty],
        duration,
        easing,
      });
    });

    Animated.sequence(animations).start();
  }

  render() {
    const { NextElement, Element, ownProps, passedProps, managerArgs } = this.props;
    let { appliedRules } = this.props;
    const { animationValues } = this;

    appliedRules = appliedRules.concat(animationValues);

    const nextProps = { Element, ownProps, passedProps, appliedRules, managerArgs };
    return React.createElement(NextElement, nextProps);
  }
};

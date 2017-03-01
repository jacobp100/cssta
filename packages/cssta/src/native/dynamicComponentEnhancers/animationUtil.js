/* eslint-disable */
const { StyleSheet } = require('react-native');
/* eslint-enable */
const { getAppliedRules } = require('../util');

module.exports.getInitialValue = targetValue => (typeof targetValue === 'number' ? targetValue : 0);

module.exports.mergeStyles = props =>
  StyleSheet.flatten(getAppliedRules(props.args.rules, props.ownProps).map(rule => rule.style));

module.exports.interpolateValue = (currentValue, previousValue, animation) => {
  if (typeof currentValue === 'number') return animation;

  if (!Array.isArray(currentValue)) {
    return animation.interpolate({
      inputRange: [0, 1],
      outputRange: [previousValue, currentValue],
    });
  }

  // transforms
  if (process.env.NODE_ENV !== 'production') {
    const currentProperties = currentValue.map(Object.keys);
    const previousProperties = previousValue.map(Object.keys);

    // Not the *best* practise here...
    const transformsAreConsistent =
      String(currentProperties) === String(previousProperties);

    if (!transformsAreConsistent) {
      throw new Error('Expected transforms to have same shape between transitions');
    }
  }

  return currentValue.map((transform, index) => {
    const previousTransform = previousValue[index];
    const property = Object.keys(transform)[0];

    // We *have* to interpolate even numeric values, as we will always animate between 0--1
    const interpolation = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [previousTransform[property], transform[property]],
    });

    return { [property]: interpolation };
  });
};

module.exports.getDurationInMs = (duration) => {
  const time = parseFloat(duration);
  const factor = /ms$/i.test(duration) ? 1 : 1000;
  return time * factor;
};

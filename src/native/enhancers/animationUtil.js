// @flow
/*
CAUTION!

This file could be included even after running the babel plugin.

Make sure you don't import large libraries.
*/
/* eslint-disable */
// $FlowFixMe
const { StyleSheet, Easing } = require("react-native");
/* eslint-enable */
const { getAppliedRules } = require("../util");
/*:: import type { Args } from '../types' */

module.exports.mergeStyles = (props /*: { ownProps: Object, args: Args } */) =>
  StyleSheet.flatten(
    getAppliedRules(props.args.rules, props.ownProps).map(rule => rule.style)
  );

/*::
export type Interpolation = number | string | [{ [key:string]: Interpolation }]
export type OutputRange = Interpolation[]
export type InterpolatedValue = Object | Object[]
*/

module.exports.interpolateValue = (
  inputRange /*: number[] */,
  outputRange /*: OutputRange */,
  animation /*: any */,
  interpolateNumbers /*: boolean */ = false
) /*: InterpolatedValue */ => {
  const firstValue = outputRange[0];
  if (interpolateNumbers && typeof firstValue === "number") {
    return animation;
  } else if (!Array.isArray(firstValue)) {
    return animation.interpolate({ inputRange, outputRange });
  }

  // transforms
  if (process.env.NODE_ENV !== "production") {
    const currentProperties = String(firstValue.map(Object.keys));
    // Not the *best* practise here...
    const transformsAreConsistent = outputRange.every(range => {
      // $FlowFixMe
      const rangeProperties = String(range.map(Object.keys));
      return currentProperties === rangeProperties;
    });

    if (!transformsAreConsistent) {
      // eslint-disable-next-line no-console
      console.error(
        "Expected transforms to have same shape between transitions"
      );
    }
  }

  return firstValue.map((transform, index) => {
    const property = Object.keys(transform)[0];
    // $FlowFixMe
    const innerOutputRange = outputRange.map(range => range[index][property]);

    // We *have* to interpolate even numeric values, as we will always animate between 0--1
    const interpolation = animation.interpolate({
      inputRange,
      outputRange: innerOutputRange
    });

    return { [property]: interpolation };
  });
};

module.exports.getDurationInMs = (duration /*: string */) /*: number */ => {
  const time = parseFloat(duration);
  const factor = /ms$/i.test(duration) ? 1 : 1000;
  return time * factor;
};

module.exports.easingFunctions = {
  linear: Easing.linear,
  ease: Easing.ease,
  "ease-in": Easing.in,
  "ease-out": Easing.out,
  "ease-in-out": Easing.inOut
};

module.exports.durationRegExp = /^\d/;

module.exports.easingRegExp = /(linear|ease(?:-in)?(?:-out)+)/i;

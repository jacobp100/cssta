const { Easing } = require("react-native");

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
    const transformProperty = Object.keys(transform)[0];
    // $FlowFixMe
    const innerOutputRange = outputRange.map(
      range => range[index][transformProperty]
    );

    // We *have* to interpolate even numeric values, as we will always animate between 0--1
    const interpolation = animation.interpolate({
      inputRange,
      outputRange: innerOutputRange
    });

    return { [transformProperty]: interpolation };
  });
};

module.exports.easingFunctions = {
  linear: Easing.linear,
  ease: Easing.ease,
  "ease-in": Easing.in,
  "ease-out": Easing.out,
  "ease-in-out": Easing.inOut
};

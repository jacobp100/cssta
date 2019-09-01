// @flow
const React = require("react");
const { StyleSheet, Animated } = require("react-native");
const { interpolateValue, easingFunctions } = require("./animationUtil");

/*::
import type { Transition } from "./flattenTransition";
*/

const getInitialValue = targetValue =>
  typeof targetValue === "number" ? targetValue : 0;

const useStyleGroup = (transition, inputStyleUnflattened) => {
  const inputStyle = StyleSheet.flatten(inputStyleUnflattened);
  const [{ style, previousStyle }, setStyleGroup] = React.useState(() => ({
    style: inputStyle,
    previousStyle: inputStyle
  }));

  const styleChanged = transition.some(
    ({ property }) => inputStyle[property] !== style[property]
  );
  if (styleChanged) {
    setStyleGroup({ style: inputStyle, previousStyle: style });
  }

  return { style, previousStyle };
};

const useAnimationValues = (transition, style) => {
  const [animationValues, setAnimationValues] = React.useState(() => {
    const values = {};
    transition.forEach(({ property }) => {
      const initialValue = getInitialValue(style[property]);
      values[property] = new Animated.Value(initialValue);
    });
    return values;
  });

  const needsNewAnimationValues =
    Object.keys(animationValues).length !== transition.length ||
    transition.some(({ property }) => animationValues[property] == null);

  if (needsNewAnimationValues) {
    const values = {};
    transition.forEach(({ property }) => {
      const existing = animationValues[property];
      if (existing != null) {
        values[property] = existing;
      } else {
        const initialValue = getInitialValue(style[property]);
        values[property] = new Animated.Value(initialValue);
      }
    });

    setAnimationValues(values);
  }

  return animationValues;
};

const animate = (transition, style, previousStyle, animationValues) => {
  // Don't run on initial mount
  if (style === previousStyle) return;

  const animations = transition.map(
    ({ property, delay, duration, timingFunction }) => {
      const animation = animationValues[property];

      const targetValue = style[property];
      const needsInterpolation = typeof targetValue !== "number";
      const toValue = !needsInterpolation ? targetValue : 1;

      if (needsInterpolation) animation.setValue(0);

      return Animated.timing(animation, {
        toValue,
        duration,
        delay,
        easing: easingFunctions[timingFunction]
      });
    }
  );

  Animated.parallel(animations).start();
};

module.exports = (
  transition /*: Transition */,
  inputStyleUnflattened /*: any */
) => {
  const { style, previousStyle } = useStyleGroup(
    transition,
    inputStyleUnflattened
  );
  const animationValues = useAnimationValues(transition, style);

  React.useLayoutEffect(() => {
    animate(transition, style, previousStyle, animationValues);
  }, [style, previousStyle]);

  const nextStyle = React.useMemo(() => {
    const animationNames = Object.keys(animationValues);

    if (animationNames.length === 0) return inputStyleUnflattened;

    const transitionStyle = {};

    animationNames.forEach(animationName => {
      const previousValue = previousStyle[animationName];
      const nextValue = style[animationName];

      if (previousValue != null && nextValue != null) {
        transitionStyle[animationName] = interpolateValue(
          [0, 1],
          [previousValue, nextValue],
          animationValues[animationName],
          true /* interpolate numbers */
        );
      }
    });

    return [style, transitionStyle];
  }, [animationValues, style, previousStyle]);

  return nextStyle;
};

import { Easing, EasingFunction } from "react-native";
import { TimingFunction } from "./AnimationTypes";

type TransformIterpolation = Array<{ [key: string]: string | number }>;
export type Interpolation = number | string | TransformIterpolation;
export type OutputRange = Interpolation[];
export type InterpolatedValue = Object | Object[];

export const interpolateValue = (
  inputRange: number[],
  outputRange: OutputRange[],
  animation: any,
  interpolateNumbers: boolean = false
): InterpolatedValue => {
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

export const easingFunctions: Record<TimingFunction, EasingFunction> = {
  linear: Easing.linear,
  ease: Easing.ease,
  "ease-in": Easing.bezier(0.42, 0, 1.0, 1.0),
  "ease-out": Easing.bezier(0, 0, 0.58, 1.0),
  "ease-in-out": Easing.bezier(0.42, 0, 0.58, 1.0)
};

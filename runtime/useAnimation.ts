import { useLayoutEffect } from "react";
import { StyleSheet, Animated } from "react-native";
import { Keyframes, Animation } from "./AnimationTypes";
import {
  interpolateValue,
  easingFunctions,
  OutputRange,
  InterpolatedValue
} from "./animationUtil";
import { Style } from "./cssUtil";

type AnimationState = {
  animations: Record<string, InterpolatedValue> | undefined;
  animationValues: Record<string, Animated.Value> | undefined;
  delay: number;
  duration: number;
  iterations: number;
  name: string | undefined;
  timingFunction: any;
};

const noAnimations: AnimationState = {
  animations: null,
  animationValues: null,
  delay: 0,
  duration: 0,
  iterations: 1,
  name: null,
  timingFunction: "ease"
};

const getAnimationState = (
  keyframes: Keyframes,
  animation: Animation | null | undefined,
  style: Style
): AnimationState => {
  if (animation == null) return noAnimations;

  const { delay, duration, iterations, name, timingFunction } = animation;
  const currentStyles = StyleSheet.flatten(style);

  const animationSequence = name != null ? keyframes[name] : null;
  if (animationSequence == null) return noAnimations;

  const animatedProperties = Object.keys(
    Object.assign({}, ...animationSequence.map(frame => frame.style))
  );

  const animationValues = {};
  const animations = {};
  animatedProperties.forEach(animationProperty => {
    animationValues[animationProperty] = new Animated.Value(0);

    const currentValue = currentStyles[animationProperty];

    let keyframes = animationSequence
      .filter(frame => animationProperty in frame.style)
      .map(({ time, style }) => ({ time, value: style[animationProperty] }));
    // Fixes missing start/end values
    keyframes = [].concat(
      keyframes[0].time > 0 ? [{ time: 0, value: currentValue }] : [],
      keyframes,
      keyframes[keyframes.length - 1].time < 1
        ? [{ time: 1, value: currentValue }]
        : []
    );

    const inputRange = keyframes.map(frame => frame.time);
    const outputRange: OutputRange = keyframes.map(frame => frame.value);
    const animation = animationValues[animationProperty];
    animations[animationProperty] = interpolateValue(
      inputRange,
      outputRange,
      animation
    );
  }, {});

  return {
    animations,
    animationValues,
    delay,
    duration,
    iterations,
    name,
    timingFunction
  };
};

const animate = ({
  delay,
  duration,
  iterations,
  timingFunction,
  animationValues: animationValuesObject
}) => {
  if (animationValuesObject == null) return;

  const animationValues: Animated.Value[] = Object.values(
    animationValuesObject
  );

  animationValues.forEach(animation => animation.setValue(0));

  const timings = animationValues.map(animation => {
    const config = {
      toValue: 1,
      duration,
      delay,
      easing:
        typeof timingFunction === "string"
          ? easingFunctions[timingFunction]
          : timingFunction
    };
    let res = Animated.timing(animation, config);

    if (iterations !== 1) {
      res = Animated.sequence([
        res,
        // Reset animation
        Animated.timing(animation, { toValue: 0, duration: 0 })
      ]);
      res = Animated.loop(res, { iterations });
    }

    return res;
  });

  Animated.parallel(timings).start();
  /*
  ({ finished }) => {
    // FIXME: This doesn't seem to clear the animation
    if (finished) {
      setState({ animations: null, animationValues: null });
    }
  }
  */
};

export default (
  keyframes: Keyframes,
  animation: Animation | null | undefined,
  style: any
) => {
  const state = getAnimationState(keyframes, animation, style);

  const { animations, name } = state;
  useLayoutEffect(() => {
    animate(state);
  }, [name]);

  const nextStyle = animations == null ? style : [style, animations];

  return nextStyle;
};

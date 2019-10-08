import { Animated } from "react-native";
import { interpolateValue } from "../animationUtil";

it("Inteprolates string values", () => {
  const animation = new Animated.Value(0);
  const interpolated = interpolateValue(
    [0, 1],
    ["red", "green"],
    animation,
    false
  );
  expect(interpolated).toEqual({
    type: "interpolate",
    value: 0,
    options: { inputRange: [0, 1], outputRange: ["red", "green"] }
  });
});

it("Inteprolates number values with interpolate numbers = false", () => {
  const animation = new Animated.Value(0);
  const interpolated = interpolateValue([0, 1], [5, 10], animation, false);
  expect(interpolated).toEqual({
    type: "interpolate",
    value: 0,
    options: { inputRange: [0, 1], outputRange: [5, 10] }
  });
});

it("Inteprolates number values with interpolate numbers = true", () => {
  const animation = new Animated.Value(0);
  const interpolated = interpolateValue([0, 1], [5, 10], animation, true);
  expect(interpolated).toEqual({ type: "value", value: 0 });
});

it("Inteprolates transforms", () => {
  const animation = new Animated.Value(0);
  const interpolated = interpolateValue(
    [0, 1],
    [
      [{ translateY: 5 }, { rotate: "30deg" }],
      [{ translateY: 10 }, { rotate: "45deg" }]
    ],
    animation,
    false
  );
  expect(interpolated).toEqual([
    {
      translateY: {
        type: "interpolate",
        value: 0,
        options: { inputRange: [0, 1], outputRange: [5, 10] }
      }
    },
    {
      rotate: {
        type: "interpolate",
        value: 0,
        options: { inputRange: [0, 1], outputRange: ["30deg", "45deg"] }
      }
    }
  ]);
});

it("Logs console error when animated transform nodes don't match", () => {
  const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  const animation = new Animated.Value(0);
  interpolateValue(
    [0, 1],
    [
      [{ translateY: 5 }, { rotate: "30deg" }],
      [{ translateY: 10 }, { rotate: "45deg" }, { scale: 3 }]
    ],
    animation,
    false
  );
  expect(consoleSpy).toBeCalledWith(
    "Expected transforms to have same shape between transitions"
  );
  consoleSpy.mockRestore();
});

it("Doesn't crash when transform nodes don't match", () => {
  const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  const animation = new Animated.Value(0);
  expect(() => {
    interpolateValue(
      [0, 1],
      [
        [{ translateY: 10 }, { rotate: "45deg" }, { scale: 3 }],
        [{ translateY: 5 }, { rotate: "30deg" }]
      ],
      animation,
      false
    );
  }).not.toThrow();
  consoleSpy.mockRestore();
});

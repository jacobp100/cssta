import React from "react";
import { AnimatedNode } from "../__mocks__/react-native";
import { create } from "react-test-renderer";
import { Animation } from "../animationTypes";
import useAnimation from "../useAnimation";

it("Fires animation on creation", () => {
  const keyframes = {
    test: [
      { time: 0, style: { color: "red" } },
      { time: 1, style: { color: "blue" } }
    ]
  };
  const animation: Animation = {
    delay: 0,
    duration: 1000,
    iterations: 1,
    name: "test",
    timingFunction: "linear"
  };

  const startSpy = jest.spyOn(AnimatedNode.prototype, "start");
  const setValueSpy = jest.spyOn(AnimatedNode.prototype, "setValue");

  let animationStyle: any;
  const Test = () => {
    [, /* inputStyle */ animationStyle] = useAnimation(
      keyframes,
      animation,
      null
    );
    return null;
  };

  const instance = create(React.createElement(Test));

  expect(animationStyle.color).toEqual({
    type: "interpolate",
    value: 0,
    options: { inputRange: [0, 1], outputRange: ["red", "blue"] }
  });
  expect(startSpy).toHaveReturnedWith({
    type: "parallel",
    value: [
      {
        type: "timing",
        value: { type: "value", value: 0 },
        options: { delay: 0, duration: 1000, easing: "linear", toValue: 1 }
      }
    ]
  });
  expect(setValueSpy).toHaveBeenCalledWith(0);
  expect(setValueSpy).toHaveReturnedWith({ type: "value", value: 0 });

  instance.unmount();
  startSpy.mockRestore();
  setValueSpy.mockRestore();
});

it("Handles no animation", () => {
  const keyframes = {
    test: [
      { time: 0, style: { color: "red" } },
      { time: 1, style: { color: "blue" } }
    ]
  };

  const startSpy = jest.spyOn(AnimatedNode.prototype, "start");
  const setValueSpy = jest.spyOn(AnimatedNode.prototype, "setValue");

  let style: any;
  const Test = () => {
    style = useAnimation(keyframes, null, null);
    return null;
  };

  const instance = create(React.createElement(Test));

  expect(style).toBe(null);
  expect(startSpy).not.toHaveBeenCalled();
  expect(setValueSpy).not.toHaveBeenCalled();

  instance.unmount();
  startSpy.mockRestore();
  setValueSpy.mockRestore();
});

it("Handles going from no animation to an animation", () => {
  const keyframes = {
    test: [
      { time: 0, style: { color: "red" } },
      { time: 1, style: { color: "blue" } }
    ]
  };
  const animation: Animation = {
    delay: 0,
    duration: 1000,
    iterations: 1,
    name: "test",
    timingFunction: "linear"
  };

  const startSpy = jest.spyOn(AnimatedNode.prototype, "start");
  const setValueSpy = jest.spyOn(AnimatedNode.prototype, "setValue");

  let style: any;
  const Test = ({ animation }: any) => {
    style = useAnimation(keyframes, animation, null);
    return null;
  };

  const instance = create(React.createElement(Test));

  expect(style).toBe(null);
  expect(startSpy).not.toHaveBeenCalled();
  expect(setValueSpy).not.toHaveBeenCalled();

  instance.update(React.createElement(Test, { animation }));

  expect(style[1].color).toEqual({
    type: "interpolate",
    value: 0,
    options: { inputRange: [0, 1], outputRange: ["red", "blue"] }
  });
  expect(startSpy).toHaveReturnedWith({
    type: "parallel",
    value: [
      {
        type: "timing",
        value: { type: "value", value: 0 },
        options: { delay: 0, duration: 1000, easing: "linear", toValue: 1 }
      }
    ]
  });
  expect(setValueSpy).toHaveBeenCalledWith(0);
  expect(setValueSpy).toHaveReturnedWith({ type: "value", value: 0 });

  instance.unmount();
  startSpy.mockRestore();
  setValueSpy.mockRestore();
});

it("Handles changing animation to an animation", () => {
  const keyframes = {
    test: [
      { time: 0, style: { color: "red" } },
      { time: 1, style: { color: "blue" } }
    ],
    other: [
      { time: 0, style: { color: "orange" } },
      { time: 1, style: { color: "purple" } }
    ]
  };
  const animation1: Animation = {
    delay: 0,
    duration: 1000,
    iterations: 1,
    name: "test",
    timingFunction: "linear"
  };
  const animation2: Animation = {
    delay: 0,
    duration: 2000,
    iterations: 1,
    name: "other",
    timingFunction: "linear"
  };

  const startSpy = jest.spyOn(AnimatedNode.prototype, "start");
  const setValueSpy = jest.spyOn(AnimatedNode.prototype, "setValue");

  let animationStyle: any;
  const Test = ({ animation }: any) => {
    [, /* inputStyle */ animationStyle] = useAnimation(
      keyframes,
      animation,
      null
    );
    return null;
  };

  const instance = create(React.createElement(Test, { animation: animation1 }));

  expect(startSpy).toHaveBeenCalledTimes(1);
  expect(animationStyle.color).toEqual({
    type: "interpolate",
    value: 0,
    options: { inputRange: [0, 1], outputRange: ["red", "blue"] }
  });
  expect(startSpy).toHaveLastReturnedWith({
    type: "parallel",
    value: [
      {
        type: "timing",
        value: { type: "value", value: 0 },
        options: { delay: 0, duration: 1000, easing: "linear", toValue: 1 }
      }
    ]
  });
  expect(setValueSpy).toHaveBeenLastCalledWith(0);
  expect(setValueSpy).toHaveLastReturnedWith({ type: "value", value: 0 });

  instance.update(React.createElement(Test, { animation: animation2 }));

  expect(startSpy).toHaveBeenCalledTimes(2);
  expect(animationStyle.color).toEqual({
    type: "interpolate",
    value: 0,
    options: { inputRange: [0, 1], outputRange: ["orange", "purple"] }
  });
  expect(startSpy).toHaveLastReturnedWith({
    type: "parallel",
    value: [
      {
        type: "timing",
        value: { type: "value", value: 0 },
        options: { delay: 0, duration: 2000, easing: "linear", toValue: 1 }
      }
    ]
  });
  expect(setValueSpy).toHaveBeenLastCalledWith(0);
  expect(setValueSpy).toHaveLastReturnedWith({ type: "value", value: 0 });

  instance.unmount();
  startSpy.mockRestore();
  setValueSpy.mockRestore();
});

it("Fires animation on creation", () => {
  const keyframes = {
    test: [
      { time: 0, style: { color: "red", opacity: 0 } },
      { time: 1, style: { color: "blue", opacity: 1 } }
    ]
  };
  const animation: Animation = {
    delay: 0,
    duration: 1000,
    iterations: 1,
    name: "test",
    timingFunction: "linear"
  };

  let animationStyle: any;
  const Test = () => {
    [, /* inputStyle */ animationStyle] = useAnimation(
      keyframes,
      animation,
      null
    );
    return null;
  };

  const instance = create(React.createElement(Test));

  expect(Object.keys(animationStyle)).toEqual(["color", "opacity"]);

  instance.unmount();
});

it("Handles looping", () => {
  const keyframes = {
    test: [
      { time: 0, style: { color: "red" } },
      { time: 1, style: { color: "blue" } }
    ]
  };
  const animation: Animation = {
    delay: 0,
    duration: 1000,
    iterations: 3,
    name: "test",
    timingFunction: "linear"
  };

  const startSpy = jest.spyOn(AnimatedNode.prototype, "start");

  const Test = () => {
    useAnimation(keyframes, animation, null);
    return null;
  };

  const instance = create(React.createElement(Test));

  expect(startSpy).toHaveReturnedWith({
    type: "parallel",
    value: [
      {
        type: "loop",
        value: {
          type: "sequence",
          value: [
            {
              type: "timing",
              value: { type: "value", value: 0 },
              options: {
                delay: 0,
                duration: 1000,
                easing: "linear",
                toValue: 1
              }
            },
            {
              type: "timing",
              value: { type: "value", value: 0 },
              options: { duration: 0, toValue: 0 }
            }
          ]
        },
        options: { iterations: 3 }
      }
    ]
  });

  instance.unmount();
  startSpy.mockRestore();
});

it("Handles no animation", () => {
  const keyframes = {};
  const animation: Animation = {
    delay: 0,
    duration: 1000,
    iterations: 3,
    name: null,
    timingFunction: "linear"
  };

  const startSpy = jest.spyOn(AnimatedNode.prototype, "start");

  const Test = () => {
    useAnimation(keyframes, animation, null);
    return null;
  };

  const instance = create(React.createElement(Test));

  expect(startSpy).not.toHaveBeenCalled();

  instance.unmount();
  startSpy.mockRestore();
});

it("Handles missing start frame", () => {
  const keyframes = {
    test: [{ time: 1, style: { color: "blue" } }]
  };
  const animation: Animation = {
    delay: 0,
    duration: 1000,
    iterations: 3,
    name: "test",
    timingFunction: "linear"
  };

  let animationStyle: any;
  const Test = () => {
    [, /* inputStyle */ animationStyle] = useAnimation(keyframes, animation, {
      color: "red"
    });
    return null;
  };

  const instance = create(React.createElement(Test));

  expect(animationStyle).toEqual({
    color: {
      type: "interpolate",
      value: 0,
      options: {
        inputRange: [0, 1],
        outputRange: ["red", "blue"]
      }
    }
  });

  instance.unmount();
});

it("Handles missing end frame", () => {
  const keyframes = {
    test: [{ time: 0, style: { color: "blue" } }]
  };
  const animation: Animation = {
    delay: 0,
    duration: 1000,
    iterations: 3,
    name: "test",
    timingFunction: "linear"
  };

  let animationStyle: any;
  const Test = () => {
    [, /* inputStyle */ animationStyle] = useAnimation(keyframes, animation, {
      color: "red"
    });
    return null;
  };

  const instance = create(React.createElement(Test));

  expect(animationStyle).toEqual({
    color: {
      type: "interpolate",
      value: 0,
      options: {
        inputRange: [0, 1],
        outputRange: ["blue", "red"]
      }
    }
  });

  instance.unmount();
});

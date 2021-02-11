import React from "react";
import { create } from "react-test-renderer";
import { Transition } from "../animationTypes";
import useTransition from "../useTransition";

it("Transitions when changing styles", () => {
  const transition: Transition = [
    {
      property: "color",
      delay: 0,
      duration: 1000,
      timingFunction: "linear",
    },
  ];

  let transitionStyle: any;
  const Test = ({ styles }) => {
    [, /* inputStyle */ transitionStyle] = useTransition(transition, styles);
    return null;
  };

  const instance = create(
    React.createElement(Test, { styles: { color: "red" } })
  );

  expect(transitionStyle).toEqual({
    color: {
      options: { inputRange: [0, 1], outputRange: ["red", "red"] },
      type: "interpolate",
      value: 0,
    },
  });

  instance.update(React.createElement(Test, { styles: { color: "blue" } }));

  expect(transitionStyle).toEqual({
    color: {
      options: { inputRange: [0, 1], outputRange: ["red", "blue"] },
      type: "interpolate",
      value: 0,
    },
  });

  instance.unmount();
});

it("Does not transition when style has no value", () => {
  const transition: Transition = [
    {
      property: "color",
      delay: 0,
      duration: 1000,
      timingFunction: "linear",
    },
  ];

  let transitionStyle: any;
  const Test = ({ styles }) => {
    [, /* inputStyle */ transitionStyle] = useTransition(transition, styles);
    return null;
  };

  const instance = create(React.createElement(Test, { styles: {} }));

  expect(transitionStyle).toEqual({});

  instance.unmount();
});

it("Handles going from no value to a new value", () => {
  const transition: Transition = [
    {
      property: "color",
      delay: 0,
      duration: 1000,
      timingFunction: "linear",
    },
  ];

  let transitionStyle: any;
  const Test = ({ styles }) => {
    [, /* inputStyle */ transitionStyle] = useTransition(transition, styles);
    return null;
  };

  const instance = create(React.createElement(Test, { styles: {} }));

  expect(transitionStyle).toEqual({});

  instance.update(React.createElement(Test, { styles: { color: "red" } }));

  expect(transitionStyle).toEqual({});

  instance.update(React.createElement(Test, { styles: { color: "blue" } }));

  expect(transitionStyle).toEqual({
    color: {
      options: { inputRange: [0, 1], outputRange: ["red", "blue"] },
      type: "interpolate",
      value: 0,
    },
  });

  instance.unmount();
});

it("Handles adding more transitioned values", () => {
  const transition1: Transition = [
    {
      property: "color",
      delay: 0,
      duration: 1000,
      timingFunction: "linear",
    },
  ];
  const transition2: Transition = [
    ...transition1,
    {
      property: "opacity",
      delay: 0,
      duration: 1000,
      timingFunction: "linear",
    },
  ];

  let transitionStyle: any;
  const Test = ({ styles, transition }) => {
    [, /* inputStyle */ transitionStyle] = useTransition(transition, styles);
    return null;
  };

  const instance = create(
    React.createElement(Test, {
      styles: { color: "red", opacity: 0 },
      transition: transition1,
    })
  );

  expect(transitionStyle).toEqual({
    color: {
      options: { inputRange: [0, 1], outputRange: ["red", "red"] },
      type: "interpolate",
      value: 0,
    },
  });

  instance.update(
    React.createElement(Test, {
      styles: { color: "blue", opacity: 0.5 },
      transition: transition1,
    })
  );

  expect(transitionStyle).toEqual({
    color: {
      options: { inputRange: [0, 1], outputRange: ["red", "blue"] },
      type: "interpolate",
      value: 0,
    },
  });

  instance.update(
    React.createElement(Test, {
      styles: { color: "green", opacity: 1 },
      transition: transition2,
    })
  );

  expect(transitionStyle).toEqual({
    color: {
      options: { inputRange: [0, 1], outputRange: ["blue", "green"] },
      type: "interpolate",
      value: 0,
    },
    opacity: { type: "value", value: 0.5 },
  });

  instance.unmount();
});

it("Handles no more transitions", () => {
  const transition: Transition = [];

  let style: any;
  const Test = ({ styles }) => {
    style = useTransition(transition, styles);
    return null;
  };

  const instance = create(
    React.createElement(Test, { styles: { color: "red" } })
  );

  expect(style).toEqual({ color: "red" });

  instance.unmount();
});

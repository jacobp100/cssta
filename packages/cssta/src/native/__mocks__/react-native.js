/* global jest */
/* eslint-disable no-param-reassign */

module.exports.StyleSheet = {
  create(body) {
    return body;
  },
};

class Value {
  constructor() { this.isAnimatedValue = true; }
  interpolate() { return this; }
  setValue() { return this; }
}

module.exports.Animated = {
  timing: jest.fn().mockImplementation(() => module.exports.Animated),
  parallel: jest.fn().mockImplementation(() => module.exports.Animated),
  start: jest.fn().mockImplementation(() => module.exports.Animated),
  Value,
};

module.exports.Easing = {
  linear: () => {},
  ease: () => {},
  in: () => {},
  out: () => {},
  inOut: () => {},
};

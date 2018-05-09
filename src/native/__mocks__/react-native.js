/* eslint-disable flowtype/require-valid-file-annotation */
/* global jest */
/* eslint-disable no-param-reassign, class-methods-use-this */

module.exports.StyleSheet = {
  create: body => body,
  flatten: styles => Object.assign({}, ...[].concat(styles))
};

class Value {
  constructor() {
    this.isAnimatedValue = true;
  }

  interpolate(value) {
    // eslint-disable-line
    const nextValue = new Value();
    nextValue.interpolation = value;
    return nextValue;
  }

  setValue() {
    return this;
  }
}

module.exports.Animated = {
  timing: jest.fn().mockImplementation(() => module.exports.Animated),
  parallel: jest.fn().mockImplementation(() => module.exports.Animated),
  sequence: jest.fn().mockImplementation(() => module.exports.Animated),
  loop: jest.fn().mockImplementation(() => module.exports.Animated),
  start: jest.fn().mockImplementation(() => module.exports.Animated),
  Value
};

module.exports.Easing = {
  linear: () => {},
  ease: () => {},
  in: () => {},
  out: () => {},
  inOut: () => {}
};

module.exports.Dimensions = {
  get: () => ({ width: 1000, height: 1000 }),
  addEventListener: () => {}
};

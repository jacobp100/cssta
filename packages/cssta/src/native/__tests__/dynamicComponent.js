/* global jest it, expect */
const React = require('react');
const renderer = require('react-test-renderer'); // eslint-disable-line
const withEnhancers = require('../withEnhancers');
const VariablesStyleSheetManager = require('../enhancers/VariablesStyleSheetManager');
const Transition = require('../enhancers/Transition');
const Animation = require('../enhancers/Animation');
const reactNativeMock = require('../__mocks__/react-native');

const defaultDynamicComponent =
  withEnhancers([VariablesStyleSheetManager, Transition, Animation]);

const runTest = ({
  type = 'button',
  propTypes = [],
  importedVariables = [],
  transitionedProperties = [],
  keyframesStyleTuples = {},
  enhancers = [VariablesStyleSheetManager, Transition, Animation],
  rules = [],
  inputProps = {},
  expectedType = type,
  expectedProps = {},
  expectedChildren = null,
} = {}) => {
  const args = { rules, keyframesStyleTuples, transitionedProperties, importedVariables };
  const dynamicComponent = withEnhancers(enhancers);
  const Element = dynamicComponent(type, propTypes, args);

  const component = renderer.create(React.createElement(Element, inputProps)).toJSON();

  expect(component.type).toEqual(expectedType);
  expect(component.props).toEqual(expectedProps);
  expect(component.children).toEqual(expectedChildren);
};

it('renders an element', () => runTest());

it('adds a boolean property if it is equal to the expected value', () => runTest({
  propTypes: ['booleanAttribute'],
  rules: [{
    validate: p => !!p.booleanAttribute,
    styleTuples: [['color', 'red']],
    transitions: {},
  }],
  inputProps: { booleanAttribute: true },
  expectedProps: { style: [{ color: 'red' }] },
}));

it('does not add a boolean property if it is not equal to the expected value', () => runTest({
  propTypes: ['booleanAttribute'],
  rules: [{
    validate: p => !!p.booleanAttribute,
    styleTuples: [['color', 'red']],
    transitions: {},
  }],
}));

it('adds a string property if it is equal to the expected value', () => runTest({
  propTypes: ['stringAttribute'],
  rules: [{
    validate: p => p.stringAttribute === 'test',
    styleTuples: [['color', 'red']],
    transitions: {},
  }],
  inputProps: { stringAttribute: 'test' },
  expectedProps: { style: [{ color: 'red' }] },
}));

it('does not add a string property if it is not equal to the expected value', () => runTest({
  propTypes: ['stringAttribute'],
  rules: [{
    validate: p => p.stringAttribute === 'test',
    styleTuples: [['color', 'red']],
    transitions: {},
  }],
}));

it('uses fallback for variable if not defined within scope', () => runTest({
  importedVariables: ['color'],
  rules: [{
    validate: () => true,
    styleTuples: [['color', 'var(--color, red)']],
    transitions: {},
  }],
  expectedProps: { style: [{ color: 'red' }] },
}));

it('converts color-mod functions', () => runTest({
  rules: [{
    validate: () => true,
    styleTuples: [['color', 'color(red tint(50%))']],
    transitions: {},
  }],
  expectedProps: { style: [{ color: 'rgb(255, 128, 128)' }] },
}));

it('transitions values', () => runTest({
  rules: [{
    validate: () => true,
    styleTuples: [['top', '0']],
    transitions: {
      top: ['1s', 'linear'],
    },
  }],
  transitionedProperties: ['top'],
  expectedProps: {
    style: [
      { top: 0 },
      { top: { isAnimatedValue: true } },
    ],
  },
}));

it('transitions colors', () => runTest({
  rules: [{
    validate: () => true,
    styleTuples: [['color', 'red']],
    transitions: {
      color: ['1s', 'linear'],
    },
  }],
  transitionedProperties: ['color'],
  expectedProps: {
    style: [
      { color: 'red' },
      {
        color: {
          isAnimatedValue: true,
          interpolation: {
            inputRange: [0, 1],
            outputRange: ['red', 'red'],
          },
        },
      },
    ],
  },
}));

it('transitions transforms', () => runTest({
  rules: [{
    validate: () => true,
    styleTuples: [['transform', 'scaleX(3) rotateX(30deg)']],
    transitions: {
      transform: ['1s', 'linear'],
    },
  }],
  transitionedProperties: ['transform'],
  expectedProps: {
    style: [
      { transform: [{ rotateX: '30deg' }, { scaleX: 3 }] },
      {
        transform: [{
          rotateX: {
            isAnimatedValue: true,
            interpolation: {
              inputRange: [0, 1],
              outputRange: ['30deg', '30deg'],
            },
          },
        }, {
          scaleX: {
            isAnimatedValue: true,
            interpolation: {
              inputRange: [0, 1],
              outputRange: [3, 3],
            },
          },
        }],
      },
    ],
  },
}));

it('transitions values using custom properties', () => runTest({
  rules: [{
    validate: () => true,
    styleTuples: [['color', 'var(--color, red)']],
    transitions: {
      color: ['1s', 'linear'],
    },
  }],
  transitionedProperties: ['color'],
  expectedProps: {
    style: [
      { color: 'red' },
      {
        color: {
          isAnimatedValue: true,
          interpolation: {
            inputRange: [0, 1],
            outputRange: ['red', 'red'],
          },
        },
      },
    ],
  },
}));

it('animates between transitioned values', () => {
  const rules = [{
    validate: () => true,
    styleTuples: [['color', 'red']],
    transitions: {
      color: ['1s', 'linear'],
    },
  }, {
    validate: props => props.active,
    styleTuples: [['color', 'blue']],
    transitions: {},
  }];
  const args = {
    rules, importedVariables: [], transitionedProperties: ['color'], keyframesStyleTuples: {},
  };
  const Element = defaultDynamicComponent('button', ['active'], args);

  const animationStartMock = reactNativeMock.Animated.start;

  animationStartMock.mockClear();
  const instance = renderer.create(React.createElement(Element, {}));

  expect(animationStartMock.mock.calls.length).toBe(0);

  instance.update(React.createElement(Element, { active: true }));

  expect(animationStartMock.mock.calls.length).toBe(1);
});

it('does not allow animating between divergent transforms', () => {
  const rules = [{
    validate: () => true,
    styleTuples: [['transform', 'scaleX(2)']],
    transitions: {
      transform: ['1s', 'linear'],
    },
  }, {
    validate: props => props.active,
    styleTuples: [['transform', 'rotateX(30deg)']],
    transitions: {},
  }];
  const args = {
    rules, importedVariables: [], transitionedProperties: ['transform'], keyframesStyleTuples: {},
  };
  const Element = defaultDynamicComponent('button', ['active'], args);

  const instance = renderer.create(React.createElement(Element, {}));

  expect(() => {
    instance.update(React.createElement(Element, { active: true }));
  }).toThrow();
});

// FIXME: Test animations

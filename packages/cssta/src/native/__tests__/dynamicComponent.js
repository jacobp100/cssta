/* eslint-disable flowtype/require-valid-file-annotation */
/* global it, expect */
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
  ruleTuples = [],
  inputProps = {},
  expectedType = type,
  expectedProps = {},
  expectedChildren = null,
} = {}) => {
  const args = { importedVariables, transitionedProperties, keyframesStyleTuples, ruleTuples };
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
  ruleTuples: [{
    validate: p => !!p.booleanAttribute,
    styleTuples: [['color', 'red']],
    transitionParts: {},
  }],
  inputProps: { booleanAttribute: true },
  expectedProps: { style: [{ color: 'red' }] },
}));

it('does not add a boolean property if it is not equal to the expected value', () => runTest({
  propTypes: ['booleanAttribute'],
  ruleTuples: [{
    validate: p => !!p.booleanAttribute,
    styleTuples: [['color', 'red']],
    transitionParts: {},
  }],
}));

it('adds a string property if it is equal to the expected value', () => runTest({
  propTypes: ['stringAttribute'],
  ruleTuples: [{
    validate: p => p.stringAttribute === 'test',
    styleTuples: [['color', 'red']],
    transitionParts: {},
  }],
  inputProps: { stringAttribute: 'test' },
  expectedProps: { style: [{ color: 'red' }] },
}));

it('does not add a string property if it is not equal to the expected value', () => runTest({
  propTypes: ['stringAttribute'],
  ruleTuples: [{
    validate: p => p.stringAttribute === 'test',
    styleTuples: [['color', 'red']],
    transitionParts: {},
  }],
}));

it('uses fallback for variable if not defined within scope', () => runTest({
  importedVariables: ['color'],
  ruleTuples: [{
    validate: () => true,
    styleTuples: [['color', 'var(--color, red)']],
    transitionParts: {},
  }],
  expectedProps: { style: [{ color: 'red' }] },
}));

it('converts color-mod functions', () => runTest({
  ruleTuples: [{
    validate: () => true,
    styleTuples: [['color', 'color(red tint(50%))']],
    transitionParts: {},
  }],
  expectedProps: { style: [{ color: 'rgb(255, 128, 128)' }] },
}));

it('transitions values', () => runTest({
  ruleTuples: [{
    validate: () => true,
    styleTuples: [['top', '0']],
    transitionParts: {
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
  ruleTuples: [{
    validate: () => true,
    styleTuples: [['color', 'red']],
    transitionParts: {
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
  ruleTuples: [{
    validate: () => true,
    styleTuples: [['transform', 'scaleX(3) rotateX(30deg)']],
    transitionParts: {
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
  ruleTuples: [{
    validate: () => true,
    styleTuples: [['color', 'var(--color, red)']],
    transitionParts: {
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
  const ruleTuples = [{
    validate: () => true,
    styleTuples: [['color', 'red']],
    transitionParts: {
      color: ['1s', 'linear'],
    },
  }, {
    validate: props => props.active,
    styleTuples: [['color', 'blue']],
    transitionParts: {},
  }];
  const args = {
    importedVariables: [], transitionedProperties: ['color'], keyframesStyleTuples: {}, ruleTuples,
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
  const ruleTuples = [{
    validate: () => true,
    styleTuples: [['transform', 'scaleX(2)']],
    transitionParts: {
      transform: ['1s', 'linear'],
    },
  }, {
    validate: props => props.active,
    styleTuples: [['transform', 'rotateX(30deg)']],
    transitionParts: {},
  }];
  const args = {
    importedVariables: [], transitionedProperties: ['transform'], keyframesStyleTuples: {}, ruleTuples,
  };
  const Element = defaultDynamicComponent('button', ['active'], args);

  const instance = renderer.create(React.createElement(Element, {}));

  expect(() => {
    instance.update(React.createElement(Element, { active: true }));
  }).toThrow();
});

it('animates values', () => runTest({
  ruleTuples: [{
    validate: () => true,
    styleTuples: [],
    animationParts: ['fade-in', '1s'],
  }],
  keyframesStyleTuples: {
    'fade-in': [
      { time: 0, styleTuples: [['opacity', '0']] },
      { time: 1, styleTuples: [['opacity', '1']] },
    ],
  },
  expectedProps: {
    style: [
      {},
      {
        opacity: {
          isAnimatedValue: true,
          interpolation: {
            inputRange: [0, 1],
            outputRange: [0, 1],
          },
        },
      },
    ],
  },
}));

it('animates colors', () => runTest({
  ruleTuples: [{
    validate: () => true,
    styleTuples: [],
    animationParts: ['fade-in', '1s'],
  }],
  keyframesStyleTuples: {
    'fade-in': [
      { time: 0, styleTuples: [['color', 'red']] },
      { time: 1, styleTuples: [['color', 'green']] },
    ],
  },
  expectedProps: {
    style: [
      {},
      {
        color: {
          isAnimatedValue: true,
          interpolation: {
            inputRange: [0, 1],
            outputRange: ['red', 'green'],
          },
        },
      },
    ],
  },
}));

it('performs keyframe animation on mount', () => {
  const ruleTuples = [{
    validate: () => true,
    styleTuples: [],
    animationParts: ['fade-in', '1s'],
  }];
  const keyframesStyleTuples = {
    'fade-in': [
      { time: 0, styleTuples: [['opacity', '0']] },
      { time: 1, styleTuples: [['opacity', '1']] },
    ],
  };
  const args = {
    importedVariables: [], transitionedProperties: [], keyframesStyleTuples, ruleTuples,
  };
  const Element = defaultDynamicComponent('button', [], args);

  const animationStartMock = reactNativeMock.Animated.start;

  animationStartMock.mockClear();
  expect(animationStartMock.mock.calls.length).toBe(0);

  renderer.create(React.createElement(Element, {}));

  expect(animationStartMock.mock.calls.length).toBe(1);
});

it('performs keyframe animation when changing animation', () => {
  const ruleTuples = [{
    validate: () => true,
    styleTuples: [],
    animationParts: ['fade-in', '1s'],
  }, {
    validate: props => props.active,
    styleTuples: [],
    animationParts: ['fade-out', '1s'],
  }];
  const keyframesStyleTuples = {
    'fade-in': [
      { time: 0, styleTuples: [['opacity', '0']] },
      { time: 1, styleTuples: [['opacity', '1']] },
    ],
    'fade-out': [
      { time: 0, styleTuples: [['opacity', '1']] },
      { time: 1, styleTuples: [['opacity', '0']] },
    ],
  };
  const args = {
    importedVariables: [], transitionedProperties: [], keyframesStyleTuples, ruleTuples,
  };
  const Element = defaultDynamicComponent('button', ['active'], args);

  const animationStartMock = reactNativeMock.Animated.start;

  animationStartMock.mockClear();
  expect(animationStartMock.mock.calls.length).toBe(0);

  const instance = renderer.create(React.createElement(Element, {}));

  expect(animationStartMock.mock.calls.length).toBe(1);

  instance.update(React.createElement(Element, { active: true }));

  expect(animationStartMock.mock.calls.length).toBe(2);
});

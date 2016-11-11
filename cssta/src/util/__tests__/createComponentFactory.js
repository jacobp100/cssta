/* global jest it, expect */
const React = require('react');
const renderer = require('react-test-renderer'); // eslint-disable-line
const createComponentFactory = require('../createComponentFactory');


const createComponent = createComponentFactory((ownProps, passedProps) => passedProps);

const runTest = ({
  type = 'button',
  propTypes = [],
  inputProps = {},
  validProps = [],
  invalidProps = [],
  expectedType = type,
  expectedProps = {},
  expectedChildren = null,
} = {}) => {
  const Element = createComponent(type, propTypes);

  const validator = Element.propTypes;
  Object.keys(inputProps).forEach((prop) => {
    validProps.forEach((value) => {
      validator(inputProps, prop, value);
    });

    invalidProps.forEach((value) => {
      expect(() => validator(inputProps, prop, value)).toThrow();
    });
  });

  const component = renderer.create(React.createElement(Element, inputProps)).toJSON();

  expect(component.type).toEqual(expectedType);
  expect(component.props).toEqual(expectedProps);
  expect(component.children).toEqual(expectedChildren);
};

it('allows constructing with another component', () => runTest({
  type: 'span',
}));

it('allows overriding the component', () => runTest({
  inputProps: { component: 'span' },
  expectedType: 'span',
  expectedProps: {},
}));

it('adds boolean propTypes', () => runTest({
  propTypes: {
    booleanAttribute: { type: 'bool' },
  },
  validProps: [
    { booleanAttribute: true },
    { booleanAttribute: false },
  ],
  invalidProps: [
    { booleanAttribute: 5 },
    { booleanAttribute: 'string' },
    { booleanAttribute: () => {} },
  ],
}));

it('adds string propTypes', () => runTest({
  propTypes: {
    booleanAttribute: {
      type: 'oneOf',
      values: ['value1', 'value2'],
    },
  },
  validProps: [
    { stringAttribute: 'value1' },
    { stringAttribute: 'value2' },
  ],
  invalidProps: [
    { stringAttribute: true },
    { stringAttribute: false },
    { stringAttribute: 5 },
    { stringAttribute: 'other string' },
    { stringAttribute: () => {} },
  ],
}));

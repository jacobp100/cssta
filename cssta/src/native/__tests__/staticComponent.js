/* global jest it, expect */
const React = require('react');
const renderer = require('react-test-renderer'); // eslint-disable-line
const staticComponent = require('../staticComponent');


const runTest = ({
  type = 'button',
  propTypes = {},
  rules = [],
  inputProps = {},
  expectedType = type,
  expectedProps = {},
  expectedChildren = null,
} = {}) => {
  const Element = staticComponent(type, propTypes, rules);

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
    style: 0,
  }],
  inputProps: { booleanAttribute: true },
  expectedProps: { style: [0] },
}));

it('does not add a boolean property if it is not equal to the expected value', () => runTest({
  propTypes: ['booleanAttribute'],
  rules: [{
    validate: p => !!p.booleanAttribute,
    style: 0,
  }],
}));

it('adds a string property if it is equal to the expected value', () => runTest({
  propTypes: ['stringAttribute'],
  rules: [{
    validate: p => p.stringAttribute === 'test',
    style: 0,
  }],
  inputProps: { stringAttribute: 'test' },
  expectedProps: { style: [0] },
}));

it('does not add a string property if it is not equal to the expected value', () => runTest({
  propTypes: ['stringAttribute'],
  rules: [{
    validate: p => p.stringAttribute === 'test',
    style: 0,
  }],
}));

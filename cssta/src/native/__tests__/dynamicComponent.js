/* global jest it, expect */
const React = require('react');
const renderer = require('react-test-renderer'); // eslint-disable-line
const dynamicComponent = require('../dynamicComponent');


const runTest = ({
  type = 'button',
  propTypes = [],
  importedVariables = [],
  rules = [],
  inputProps = {},
  expectedType = type,
  expectedProps = {},
  expectedChildren = null,
} = {}) => {
  const Element = dynamicComponent(type, propTypes, importedVariables, rules);

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
  }],
  inputProps: { booleanAttribute: true },
  expectedProps: { style: [{ color: 'red' }] },
}));

it('does not add a boolean property if it is not equal to the expected value', () => runTest({
  propTypes: ['booleanAttribute'],
  rules: [{
    validate: p => !!p.booleanAttribute,
    styleTuples: [['color', 'red']],
  }],
}));

it('adds a string property if it is equal to the expected value', () => runTest({
  propTypes: ['stringAttribute'],
  rules: [{
    validate: p => p.stringAttribute === 'test',
    styleTuples: [['color', 'red']],
  }],
  inputProps: { stringAttribute: 'test' },
  expectedProps: { style: [{ color: 'red' }] },
}));

it('does not add a string property if it is not equal to the expected value', () => runTest({
  propTypes: ['stringAttribute'],
  rules: [{
    validate: p => p.stringAttribute === 'test',
    styleTuples: [['color', 'red']],
  }],
}));

it('uses fallback for variable if not defined within scope', () => runTest({
  importedVariables: ['color'],
  rules: [{
    validate: () => true,
    styleTuples: [['color', 'var(--color, red)']],
  }],
  expectedProps: { style: [{ color: 'red' }] },
}));

it('converts color-mod functions', () => runTest({
  rules: [{
    validate: () => true,
    styleTuples: [['color', 'color(red tint(50%))']],
  }],
  expectedProps: { style: [{ color: 'rgb(255, 128, 128)' }] },
}));

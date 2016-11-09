/* global jest it, expect */
const React = require('react');
const renderer = require('react-test-renderer'); // eslint-disable-line
const createComponent = require('./createComponent');


const runTest = ({
  type = 'button',
  defaultClassName = null,
  classNameMap = {},
  inputProps = {},
  validProps = [],
  invalidProps = [],
  expectedType = type,
  expectedProps = {},
  expectedChildren = null,
} = {}) => {
  const Element = createComponent(type, defaultClassName, classNameMap);

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

it('renders an element', () => runTest());

it('adds a default class', () => runTest({
  defaultClassName: 'default',
  expectedProps: { className: 'default' },
}));

it('adds adds a boolean property', () => runTest({
  classNameMap: { booleanAttribute: 'class' },
  inputProps: { booleanAttribute: true },
  expectedProps: { className: 'class' },
}));

it('does not add boolean properties if they are not passed', () => runTest({
  classNameMap: { booleanAttribute: 'class' },
  inputProps: {},
}));

it('adds adds a string property', () => runTest({
  classNameMap: { stringAttribute: { value: 'class' } },
  inputProps: { stringAttribute: 'value' },
  expectedProps: { className: 'class' },
}));

it('does not add string properties if they are not passed', () => runTest({
  classNameMap: { stringAttribute: { value: 'class' } },
  inputProps: {},
}));

it('passes extraneous props down', () => runTest({
  classNameMap: { booleanAttribute: 'class' },
  inputProps: { type: 'button', booleanAttribute: true },
  expectedProps: { type: 'button', className: 'class' },
}));

it('allows setting className', () => runTest({
  inputProps: { className: 'test' },
  expectedProps: { className: 'test' },
}));

it('allows extending className with default class name', () => runTest({
  defaultClassName: 'default',
  inputProps: { className: 'test' },
  expectedProps: { className: 'default test' },
}));

it('allows extending className with props', () => runTest({
  classNameMap: { booleanAttribute: 'class' },
  inputProps: { className: 'test', booleanAttribute: true },
  expectedProps: { className: 'test class' },
}));

it('allows setting style', () => runTest({
  inputProps: { style: { top: 5 } },
  expectedProps: { style: { top: 5 } },
}));

it('allows constructing with another component', () => runTest({
  type: 'span',
}));

it('allows overriding the component', () => runTest({
  inputProps: { component: 'span' },
  expectedType: 'span',
  expectedProps: {},
}));

it('adds boolean propTypes', () => runTest({
  classNameMap: { booleanAttribute: 'class' },
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
  classNameMap: { stringAttribute: { value1: 'a', value2: 'b' } },
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

/* eslint-disable flowtype/require-valid-file-annotation */
/* global it, expect */
const React = require('react');
const renderer = require('react-test-renderer'); // eslint-disable-line
const createComponent = require('../createComponent');


const runTest = ({
  type = 'button',
  defaultClassName = null,
  classNameMap = [],
  propTypes = Object.keys(classNameMap),
  inputProps = {},
  expectedType = type,
  expectedProps = {},
  expectedChildren = null,
} = {}) => {
  const Element = createComponent(type, propTypes, { defaultClassName, classNameMap });

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
  classNameMap: { booleanAttribute: { true: 'class' } },
  inputProps: { booleanAttribute: true },
  expectedProps: { className: 'class' },
}));

it('does not add boolean properties if they are not passed', () => runTest({
  classNameMap: { booleanAttribute: { true: 'class' } },
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
  classNameMap: { booleanAttribute: { true: 'class' } },
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
  classNameMap: { booleanAttribute: { true: 'class' } },
  inputProps: { className: 'test', booleanAttribute: true },
  expectedProps: { className: 'class test' },
}));

it('allows setting style', () => runTest({
  inputProps: { style: { top: 5 } },
  expectedProps: { style: { top: 5 } },
}));

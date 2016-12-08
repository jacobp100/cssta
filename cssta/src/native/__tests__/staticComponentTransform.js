/* global jest it, expect */
const renderer = require('react-test-renderer'); // eslint-disable-line
const staticComponentTransform = require('../staticComponentTransform');


const runTest = ({
  ownProps = {},
  passedProps = {},
  rules = [],
  expectedProps = {},
} = {}) => {
  const actualProps = staticComponentTransform(ownProps, passedProps, rules);
  expect(actualProps).toEqual(expectedProps);
};

it('does not pass own props down', () => runTest({
  ownProps: { style: 'fancy' },
  expectedProps: {},
}));

it('passes passed props down', () => runTest({
  passedProps: { scrollingEnabled: false },
  expectedProps: { scrollingEnabled: false },
}));

it('validates rules', () => runTest({
  rules: [{
    validate: () => true,
    style: 0,
  }],
  expectedProps: { style: [0] },
}));

it('validates rules using owns props', () => runTest({
  rules: [{
    validate: p => p.style === 'fancy',
    style: 0,
  }],
  ownProps: { style: 'fancy' },
  expectedProps: { style: [0] },
}));

it('does not validate invalid rules', () => runTest({
  rules: [{
    validate: p => p.style === 'fancy',
    style: 0,
  }],
  ownProps: { style: 'dull and boring' },
  expectedProps: {},
}));

it('passes down passed props as well as using own props', () => runTest({
  rules: [{
    validate: () => true,
    style: 0,
  }],
  passedProps: { scrollingEnabled: false },
  expectedProps: { scrollingEnabled: false, style: [0] },
}));

it('allows adding a style', () => runTest({
  passedProps: { style: [0] },
  expectedProps: { style: [0] },
}));

it('allows extending a style with a style array', () => runTest({
  rules: [{
    validate: () => true,
    style: 0,
  }],
  passedProps: { style: [1] },
  expectedProps: { style: [0, 1] },
}));

it('allows extending a style with a single value', () => runTest({
  rules: [{
    validate: () => true,
    style: 0,
  }],
  passedProps: { style: 1 },
  expectedProps: { style: [0, 1] },
}));

it('allows extending a style with an object', () => runTest({
  rules: [{
    validate: () => true,
    style: 0,
  }],
  passedProps: { style: { color: 'red' } },
  expectedProps: { style: [0, { color: 'red' }] },
}));

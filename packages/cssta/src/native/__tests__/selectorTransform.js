/* eslint-disable flowtype/require-valid-file-annotation */
/* global jest it, expect */
const {
  getValidatorSourceForSelector, createValidatorForSelector,
} = require('../selectorTransform');

const runTest = (selector, { valid = [], invalid = [] }) => {
  const validator = createValidatorForSelector(selector);

  valid.forEach((props) => {
    expect(validator(props)).toBe(true);
  });

  invalid.forEach((props) => {
    expect(validator(props)).toBe(false);
  });
};

// Note that getRoot replaces @ with * (so it parses). We have to use * here.

it('creates a function that validates boolean attributes', () => runTest('[*bool]', {
  valid: [{ bool: true }, { bool: true, otherAttribute: true }],
  invalid: [{}, { bool: false }, { otherAttribute: true }],
}));

it('creates a function that validates string attributes', () => runTest('[*string = "test"]', {
  valid: [{ string: 'test' }, { string: 'test', otherAttribute: true }],
  invalid: [{}, { string: 'other' }, { otherAttribute: true }],
}));

it('combines multiple validators', () => runTest('[*bool][*string = "test"]', {
  valid: [
    { bool: true, string: 'test' },
    { bool: true, string: 'test', otherAttribute: true },
  ],
  invalid: [
    {},
    { string: 'test' },
    { bool: true },
    { string: 'other', bool: true },
    { string: 'test', bool: false },
    { otherAttribute: true },
  ],
}));

it('validates everything for & selector', () => runTest('&', {
  valid: [{}, { otherAttribute: true }],
}));

it('works with :matches for same prop', () => runTest(':matches([*string = "a"], [*string = "b"])', {
  valid: [{ string: 'a' }, { string: 'b' }, { string: 'a', otherAttribute: true }],
  invalid: [{}, { string: 'other' }, { otherAttribute: true }],
}));

it('works with :matches for different props', () => runTest(':matches([*string = "a"], [*bool])', {
  valid: [{ string: 'a' }, { bool: true }, { string: 'a', otherAttribute: true }],
  invalid: [{}, { string: 'other' }, { bool: false }, { otherAttribute: true }],
}));

it('works with :not for same prop', () => runTest(':not([*string = "a"], [*string = "b"])', {
  valid: [{}, { string: 'other' }, { otherAttribute: true }],
  invalid: [{ string: 'a' }, { string: 'b' }, { string: 'a', otherAttribute: true }],
}));

it('works with :not for different props', () => runTest(':not([*string = "a"], [*bool])', {
  valid: [{}, { string: 'other' }, { bool: false }, { otherAttribute: true }],
  invalid: [{ string: 'a' }, { bool: true }, { string: 'a', otherAttribute: true }],
}));

it('does not allow other pseudo selectors', () => {
  expect(() => createValidatorForSelector(':first-child')).toThrow();
});

it('creates function source for node', () => {
  const node = getValidatorSourceForSelector('&');
  expect(node).toEqual('(function(p) {return true;})');
});

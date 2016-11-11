/* global jest it, expect */
const getRoot = require('../getRoot');

const trim = str =>
  str.split('\n').map(line => line.trim()).filter(line => line !== '').join('\n');

const runTestFor = (inputCss, expectedCss = inputCss, expectedPropTypes = {}) => {
  const { root, propTypes: actualPropTypes } = getRoot(inputCss);
  const actualCss = root.toString();

  expect(trim(actualCss)).toBe(trim(expectedCss));
  expect(actualPropTypes).toEqual(expectedPropTypes);
};

const shouldThrow = (inputCss) => {
  expect(() => getRoot(inputCss)).toThrow();
};

it('nests top-level declarations', () => runTestFor(`
  color: red;
`, `
  & {
    color: red
  }
`));

it('nests within @-rules', () => runTestFor(`
  @supports (color: red) {
    color: red;
  }

  @media (screen) {
    color: green;
  }
`, `
  @supports (color: red) {
    & {
      color: red
    }
  }

  @media (screen) {
    & {
      color: green
    }
  }
`));

it('does not re-nest nested rules', () => runTestFor(`
  & {
    color: red;
  }
`));

it('generates prop type for bool attributes', () => runTestFor(`
  [attribute] {
    color: red;
  }
`, undefined, {
  attribute: { type: 'bool' },
}));

it('generates prop type for string attributes', () => runTestFor(`
  [attribute = "1"] {
    color: red;
  }

  [attribute = "2"] {
    color: red;
  }
`, undefined, {
  attribute: { type: 'oneOf', values: ['1', '2'] },
}));

it('generates multile prop types for multiple attributes', () => runTestFor(`
  [boolAttribute] {
    color: red;
  }

  [stringAttribute = "1"] {
    color: red;
  }

  [stringAttribute = "2"] {
    color: red;
  }
`, undefined, {
  boolAttribute: { type: 'bool' },
  stringAttribute: { type: 'oneOf', values: ['1', '2'] },
}));

it('only defines values for string attribute once', () => runTestFor(`
  [attribute = "1"] {
    color: red;
  }

  [attribute = "1"] {
    color: red;
  }
`, undefined, {
  attribute: { type: 'oneOf', values: ['1'] },
}));

it('does not nest declarations within keyframes', () => runTestFor(`
  @keyframes test {
    color: red;
  }
`));

it('does not nest nested rules', () => runTestFor(`
  & {
    color: red;
  }
`));

it('does not allow combinators', () => shouldThrow(`
  & & {
    color: red;
  }
`));

it('enforces scoping', () => shouldThrow(`
  h1 {
    color: red;
  }
`));

it('does not allow case-insensitive attributes', () => shouldThrow(`
  [attribute = "value" i] {
    color: red;
  }
`));

it('only allows = as operator in attribute', () => shouldThrow(`
  [attribute ~= "value"] {
    color: red;
  }
`));

it('does not allow attributes to be called "component"', () => shouldThrow(`
  [component] {
    color: red;
  }
`));

it('enforces consistent prop types', () => shouldThrow(`
  [mixedAttribute] {
    color: red;
  }

  [mixedAttribute = "value"] {
    color: red;
  }
`));

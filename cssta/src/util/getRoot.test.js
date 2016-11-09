/* global jest it, expect */
const getRoot = require('./getRoot');

const trim = str =>
  str.split('\n').map(line => line.trim()).filter(line => line !== '').join('\n');

const runTestFor = (inputCss, expectedCss = inputCss) => {
  const { root } = getRoot(inputCss);
  const actualCss = root.toString();

  expect(trim(actualCss)).toBe(trim(expectedCss));
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

it('does not nest declarations in rules', () => runTestFor(`
  [attribute] {
    color: red;
  }
`));

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

it('does not nest attribute rules', () => runTestFor(`
  [attribute] {
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

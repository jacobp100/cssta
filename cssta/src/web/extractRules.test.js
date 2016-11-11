/* global jest it, expect */
const extractRules = require('./extractRules');

const trim = str =>
  str.split('\n').map(line => line.trim()).filter(line => line !== '').join('\n');

const runTestFor = (inputCss, expectedCss, {
  defaultClassName = null,
  scopedClassNames = [],
  classNameMap: expectedClassNameMap = {},
} = {}) => {
  const classNames = defaultClassName
    ? [defaultClassName, ...scopedClassNames]
    : scopedClassNames;

  const generateClassName = classNames.reduce((mock, name) => (
    mock.mockImplementationOnce(() => name)
  ), jest.fn());
  const generateAnimationName = generateClassName;

  const { css, baseClassName, classNameMap: actualClassNameMap } = extractRules(inputCss, {
    generateClassName,
    generateAnimationName,
  });

  expect(generateClassName.mock.calls.length).toBe(classNames.length);
  expect(trim(css)).toBe(trim(expectedCss));
  expect(baseClassName).toBe(defaultClassName);
  expect(actualClassNameMap).toEqual(expectedClassNameMap);
};

it('scopes top-level declarations', () => runTestFor(`
  color: red;
`, `
  .default {
    color: red
  }
`, {
  defaultClassName: 'default',
}));

it('scopes multiple top-level declarations into one class', () => runTestFor(`
  color: red;
  background: green;
`, `
  .default {
    color: red;
    background: green
  }
`, {
  defaultClassName: 'default',
}));

it('scopes boolean attribute selectors', () => runTestFor(`
  [booleanAttribute] {
    color: red;
  }
`, `
  .scoped-1 {
    color: red;
  }
`, {
  scopedClassNames: ['scoped-1'],
  classNameMap: {
    booleanAttribute: { true: 'scoped-1' },
  },
}));

it('scopes string attribute selectors', () => runTestFor(`
  [stringAttribute = "red"] {
    color: red;
  }
`, `
  .scoped-1 {
    color: red;
  }
`, {
  scopedClassNames: ['scoped-1'],
  classNameMap: {
    stringAttribute: {
      red: 'scoped-1',
    },
  },
}));

it('scopes multiple string attribute selectors', () => runTestFor(`
  [stringAttribute = "red"] {
    color: red;
  }

  [stringAttribute = "green"] {
    color: green;
  }

  [stringAttribute = "blue"] {
    color: blue;
  }
`, `
  .scoped-1 {
    color: red;
  }

  .scoped-2 {
    color: green;
  }

  .scoped-3 {
    color: blue;
  }
`, {
  scopedClassNames: ['scoped-1', 'scoped-2', 'scoped-3'],
  classNameMap: {
    stringAttribute: {
      red: 'scoped-1',
      green: 'scoped-2',
      blue: 'scoped-3',
    },
  },
}));

it('scopes different boolean attributes', () => runTestFor(`
  [value1] {
    color: red;
  }

  [value2] {
    color: green;
  }

  [value3] {
    color: blue;
  }
`, `
  .scoped-1 {
    color: red;
  }

  .scoped-2 {
    color: green;
  }

  .scoped-3 {
    color: blue;
  }
`, {
  scopedClassNames: ['scoped-1', 'scoped-2', 'scoped-3'],
  classNameMap: {
    value1: { true: 'scoped-1' },
    value2: { true: 'scoped-2' },
    value3: { true: 'scoped-3' },
  },
}));

it('scopes different string attributes', () => runTestFor(`
  [value1 = "a"] {
    color: red;
  }

  [value1 = "b"] {
    color: green;
  }

  [value2 = "c"] {
    color: blue;
  }
`, `
  .scoped-1 {
    color: red;
  }

  .scoped-2 {
    color: green;
  }

  .scoped-3 {
    color: blue;
  }
`, {
  scopedClassNames: ['scoped-1', 'scoped-2', 'scoped-3'],
  classNameMap: {
    value1: {
      a: 'scoped-1',
      b: 'scoped-2',
    },
    value2: {
      c: 'scoped-3',
    },
  },
}));

it('only scopes boolean attributes once', () => runTestFor(`
  [booleanAttribute] {
    color: red;
  }

  :not([booleanAttribute]) {
    color: blue;
  }
`, `
  .scoped-1 {
    color: red;
  }

  :not(.scoped-1) {
    color: blue;
  }
`, {
  scopedClassNames: ['scoped-1'],
  classNameMap: {
    booleanAttribute: { true: 'scoped-1' },
  },
}));

it('only scopes string attributes once', () => runTestFor(`
  [stringAttribute = "value"] {
    color: red;
  }

  :not([stringAttribute = "value"]) {
    color: blue;
  }
`, `
  .scoped-1 {
    color: red;
  }

  :not(.scoped-1) {
    color: blue;
  }
`, {
  scopedClassNames: ['scoped-1'],
  classNameMap: {
    stringAttribute: {
      value: 'scoped-1',
    },
  },
}));

it('mixes boolean and string attributes', () => runTestFor(`
  [booleanAttribute] {
    color: red;
  }

  [stringAttribute = "value"] {
    color: green;
  }
`, `
  .scoped-1 {
    color: red;
  }

  .scoped-2 {
    color: green;
  }
`, {
  scopedClassNames: ['scoped-1', 'scoped-2'],
  classNameMap: {
    booleanAttribute: { true: 'scoped-1' },
    stringAttribute: {
      value: 'scoped-2',
    },
  },
}));

it('scopes keyframes', () => runTestFor(`
  [class] {
    animation: 1s test;
  }

  @keyframes test {
    0% { opacity: 0; }
  }
`, `
  .class {
    animation: 1s animation;
  }

  @keyframes animation {
    0% { opacity: 0; }
  }
`, {
  scopedClassNames: ['animation', 'class'],
  classNameMap: {
    class: { true: 'class' },
  },
}));

it('does not scope global keyframes', () => runTestFor(`
  animation: 1s test;
`, `
  .default {
    animation: 1s test
  }
`, {
  defaultClassName: 'default',
}));

it('allows @media for top-level declarations', () => runTestFor(`
  @media (screen) {
    color: red;
  }
`, `
  @media (screen) {
    .default {
      color: red
    }
  }
`, {
  defaultClassName: 'default',
}));

it('allows @media for rules', () => runTestFor(`
  @media (screen) {
    [attribute] {
      color: red;
    }
  }
`, `
  @media (screen) {
    .scoped {
      color: red;
    }
  }
`, {
  scopedClassNames: ['scoped'],
  classNameMap: {
    attribute: { true: 'scoped' },
  },
}));

it('allows @supports for top-level declarations', () => runTestFor(`
  @supports (color: red) {
    color: red;
  }
`, `
  @supports (color: red) {
    .default {
      color: red
    }
  }
`, {
  defaultClassName: 'default',
}));

it('allows @supports for rules', () => runTestFor(`
  @supports (color: red) {
    [attribute] {
      color: red;
    }
  }
`, `
  @supports (color: red) {
    .scoped {
      color: red;
    }
  }
`, {
  scopedClassNames: ['scoped'],
  classNameMap: {
    attribute: { true: 'scoped' },
  },
}));

it('leaves @import unchanged', () => runTestFor(`
  @import 'external.css';
`, `
  @import 'external.css';
`));

it('maintains order precedence', () => runTestFor(`
  color: red;

  [attribute] {
    color: blue;
  }

  color: green;
`, `
  .default {
    color: red;
  }

  .scoped-1 {
    color: blue;
  }

  .default {
    color: green;
  }
`, {
  defaultClassName: 'default',
  scopedClassNames: ['scoped-1'],
  classNameMap: {
    attribute: { true: 'scoped-1' },
  },
}));

it('throws if one attribute is both a boolean and a string', () => {
  expect(() => {
    extractRules(`
      [attribute] {}
      [attribute = "string"] {}
    `);
  }).toThrow();
});

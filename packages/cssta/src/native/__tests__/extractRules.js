/* global jest it, expect */
const extractRules = require('../extractRules');

const runTestFor = (inputCss, rules = []) => {
  const { rules: actualRules } = extractRules(inputCss);
  expect(actualRules).toEqual(rules);
};

it('scopes top-level declarations', () => runTestFor(`
  color: red;
`, [{
  selector: '&',
  styleTuples: [['color', 'red']],
  exportedVariables: {},
  importedVariables: [],
}]));

it('scopes multiple top-level declarations into one class', () => runTestFor(`
  color: red;
  borderLeftColor: green;
`, [{
  selector: '&',
  styleTuples: [
    ['color', 'red'],
    ['borderLeftColor', 'green'],
  ],
  exportedVariables: {},
  importedVariables: [],
}]));

it('scopes boolean attribute selectors', () => runTestFor(`
  [attribute] {
    color: red;
  }
`, [{
  selector: '[attribute]',
  styleTuples: [['color', 'red']],
  exportedVariables: {},
  importedVariables: [],
}]));

it('scopes string attribute selectors', () => runTestFor(`
  [stringAttribute = "red"] {
    color: red;
  }
`, [{
  selector: '[stringAttribute = "red"]',
  styleTuples: [['color', 'red']],
  exportedVariables: {},
  importedVariables: [],
}]));

it('scopes attribute selectors', () => runTestFor(`
  [booleanValue1] {
    color: red;
  }

  [booleanValue2] {
    color: green;
  }

  [stringValue1 = "a"] {
    color: red;
  }

  [stringValue1 = "b"] {
    color: green;
  }

  [stringValue2 = "c"] {
    color: blue;
  }
`, [{
  selector: '[booleanValue1]',
  styleTuples: [['color', 'red']],
  exportedVariables: {},
  importedVariables: [],
}, {
  selector: '[booleanValue2]',
  styleTuples: [['color', 'green']],
  exportedVariables: {},
  importedVariables: [],
}, {
  selector: '[stringValue1 = "a"]',
  styleTuples: [['color', 'red']],
  exportedVariables: {},
  importedVariables: [],
}, {
  selector: '[stringValue1 = "b"]',
  styleTuples: [['color', 'green']],
  exportedVariables: {},
  importedVariables: [],
}, {
  selector: '[stringValue2 = "c"]',
  styleTuples: [['color', 'blue']],
  exportedVariables: {},
  importedVariables: [],
}]));

it('recognises variable declarations', () => runTestFor(`
  --color: red;
`, [{
  selector: '&',
  styleTuples: [],
  exportedVariables: {
    color: 'red',
  },
  importedVariables: [],
}]));

it('recognises variable imports', () => runTestFor(`
  color: var(--color);
`, [{
  selector: '&',
  styleTuples: [['color', 'var(--color)']],
  exportedVariables: {},
  importedVariables: ['color'],
}]));

it('recognises multiple variable declarations', () => runTestFor(`
  --color: red;
  --color: blue;
  --other: green;
`, [{
  selector: '&',
  styleTuples: [],
  exportedVariables: {
    color: 'blue',
    other: 'green',
  },
  importedVariables: [],
}]));

it('recognises multiple variable imports', () => runTestFor(`
  margin: var(--large) var(--small);
`, [{
  selector: '&',
  styleTuples: [['margin', 'var(--large) var(--small)']],
  exportedVariables: {},
  importedVariables: ['large', 'small'],
}]));

it('mixes variable and style declarations', () => runTestFor(`
  --color: red;
  color: var(--color);
`, [{
  selector: '&',
  styleTuples: [['color', 'var(--color)']],
  exportedVariables: {
    color: 'red',
  },
  importedVariables: ['color'],
}]));

it('returns all imported variables without duplicates', () => {
  const { importedVariables } = extractRules(`
    color: var(--color);

    [inverted] {
      backgroundColor: var(--color);
      color: var(--background);
    }
  `);

  expect(importedVariables).toEqual(['color', 'background']);
});

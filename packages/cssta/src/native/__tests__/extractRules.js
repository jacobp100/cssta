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
  transitions: {},
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
  transitions: {},
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
  transitions: {},
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
  transitions: {},
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
  transitions: {},
}, {
  selector: '[booleanValue2]',
  styleTuples: [['color', 'green']],
  exportedVariables: {},
  importedVariables: [],
  transitions: {},
}, {
  selector: '[stringValue1 = "a"]',
  styleTuples: [['color', 'red']],
  exportedVariables: {},
  importedVariables: [],
  transitions: {},
}, {
  selector: '[stringValue1 = "b"]',
  styleTuples: [['color', 'green']],
  exportedVariables: {},
  importedVariables: [],
  transitions: {},
}, {
  selector: '[stringValue2 = "c"]',
  styleTuples: [['color', 'blue']],
  exportedVariables: {},
  importedVariables: [],
  transitions: {},
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
  transitions: {},
}]));

it('recognises variable imports', () => runTestFor(`
  color: var(--color);
`, [{
  selector: '&',
  styleTuples: [['color', 'var(--color)']],
  exportedVariables: {},
  importedVariables: ['color'],
  transitions: {},
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
  transitions: {},
}]));

it('recognises multiple variable imports', () => runTestFor(`
  margin: var(--large) var(--small);
`, [{
  selector: '&',
  styleTuples: [['margin', 'var(--large) var(--small)']],
  exportedVariables: {},
  importedVariables: ['large', 'small'],
  transitions: {},
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
  transitions: {},
}]));

it('returns all imported variables without duplicates', () => {
  const { managerArgs } = extractRules(`
    color: var(--color);

    [inverted] {
      backgroundColor: var(--color);
      color: var(--background);
    }
  `);

  const { importedVariables } = managerArgs;

  expect(importedVariables).toEqual(['color', 'background']);
});

it('recognises transitions', () => runTestFor(`
  color: red;
  transition: color 1s linear;
`, [{
  selector: '&',
  styleTuples: [
    ['color', 'red'],
  ],
  exportedVariables: {},
  importedVariables: [],
  transitions: {
    color: ['1s', 'linear'],
  },
}]));

it('recognises multiple separate transitions', () => runTestFor(`
  color: red;
  transition: scaleX(30deg);
  transition: color 1s linear, transition 2s ease-in-out;
`, [{
  selector: '&',
  styleTuples: [
    ['color', 'red'],
  ],
  exportedVariables: {},
  importedVariables: [],
  transitions: {
    color: ['1s', 'linear'],
    transition: ['2s', 'ease-in-out'],
  },
}]));

it('recognises multiple property transitions', () => runTestFor(`
  color: red;
  transition: scaleX(30deg);
  transition: color transition 1s linear;
`, [{
  selector: '&',
  styleTuples: [
    ['color', 'red'],
  ],
  exportedVariables: {},
  importedVariables: [],
  transitions: {
    color: ['1s', 'linear'],
    transition: ['1s', 'linear'],
  },
}]));

it('recognises multiple allows variables in transitions', () => runTestFor(`
  color: red;
  transition: color var(--time) var(--easing);
`, [{
  selector: '&',
  styleTuples: [
    ['color', 'red'],
  ],
  exportedVariables: {},
  importedVariables: ['time', 'easing'],
  transitions: {
    color: ['var(--time)', 'var(--easing)'],
  },
}]));

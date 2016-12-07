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
  variables: {},
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
  variables: {},
}]));

it('scopes boolean attribute selectors', () => runTestFor(`
  [attribute] {
    color: red;
  }
`, [{
  selector: '[attribute]',
  styleTuples: [['color', 'red']],
  variables: {},
}]));

it('scopes string attribute selectors', () => runTestFor(`
  [stringAttribute = "red"] {
    color: red;
  }
`, [{
  selector: '[stringAttribute = "red"]',
  styleTuples: [['color', 'red']],
  variables: {},
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
  variables: {},
}, {
  selector: '[booleanValue2]',
  styleTuples: [['color', 'green']],
  variables: {},
}, {
  selector: '[stringValue1 = "a"]',
  styleTuples: [['color', 'red']],
  variables: {},
}, {
  selector: '[stringValue1 = "b"]',
  styleTuples: [['color', 'green']],
  variables: {},
}, {
  selector: '[stringValue2 = "c"]',
  styleTuples: [['color', 'blue']],
  variables: {},
}]));

it('recognises variable declarations', () => runTestFor(`
  --color: red;
`, [{
  selector: '&',
  styleTuples: [],
  variables: {
    color: 'red',
  },
}]));

it('recognises multiple variable declarations', () => runTestFor(`
  --color: red;
  --color: blue;
  --other: green;
`, [{
  selector: '&',
  styleTuples: [],
  variables: {
    color: 'blue',
    other: 'green',
  },
}]));

it('mixes variable and style declarations', () => runTestFor(`
  --color: red;
  color: var(--color);
`, [{
  selector: '&',
  styleTuples: [['color', 'var(--color)']],
  variables: {
    color: 'red',
  },
}]));

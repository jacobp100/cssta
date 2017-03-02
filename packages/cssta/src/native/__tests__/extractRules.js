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
  transitions: {},
  animation: null,
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
  transitions: {},
  animation: null,
}]));

it('scopes boolean attribute selectors', () => runTestFor(`
  [attribute] {
    color: red;
  }
`, [{
  selector: '[attribute]',
  styleTuples: [['color', 'red']],
  exportedVariables: {},
  transitions: {},
  animation: null,
}]));

it('scopes string attribute selectors', () => runTestFor(`
  [stringAttribute = "red"] {
    color: red;
  }
`, [{
  selector: '[stringAttribute = "red"]',
  styleTuples: [['color', 'red']],
  exportedVariables: {},
  transitions: {},
  animation: null,
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
  transitions: {},
  animation: null,
}, {
  selector: '[booleanValue2]',
  styleTuples: [['color', 'green']],
  exportedVariables: {},
  transitions: {},
  animation: null,
}, {
  selector: '[stringValue1 = "a"]',
  styleTuples: [['color', 'red']],
  exportedVariables: {},
  transitions: {},
  animation: null,
}, {
  selector: '[stringValue1 = "b"]',
  styleTuples: [['color', 'green']],
  exportedVariables: {},
  transitions: {},
  animation: null,
}, {
  selector: '[stringValue2 = "c"]',
  styleTuples: [['color', 'blue']],
  exportedVariables: {},
  transitions: {},
  animation: null,
}]));

it('recognises variable declarations', () => runTestFor(`
  --color: red;
`, [{
  selector: '&',
  styleTuples: [],
  exportedVariables: {
    color: 'red',
  },
  transitions: {},
  animation: null,
}]));

it('recognises variable imports', () => runTestFor(`
  color: var(--color);
`, [{
  selector: '&',
  styleTuples: [['color', 'var(--color)']],
  exportedVariables: {},
  transitions: {},
  animation: null,
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
  transitions: {},
  animation: null,
}]));

it('recognises multiple variable imports', () => runTestFor(`
  margin: var(--large) var(--small);
`, [{
  selector: '&',
  styleTuples: [['margin', 'var(--large) var(--small)']],
  exportedVariables: {},
  transitions: {},
  animation: null,
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
  transitions: {},
  animation: null,
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
  transitions: {
    color: ['1s', 'linear'],
  },
  animation: null,
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
  transitions: {
    color: ['1s', 'linear'],
    transition: ['2s', 'ease-in-out'],
  },
  animation: null,
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
  transitions: {
    color: ['1s', 'linear'],
    transition: ['1s', 'linear'],
  },
  animation: null,
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
  transitions: {
    color: ['var(--time)', 'var(--easing)'],
  },
  animation: null,
}]));

it('recognises animations', () => runTestFor(`
  animation: test 1s linear;
`, [{
  selector: '&',
  styleTuples: [],
  exportedVariables: {},
  transitions: {},
  animation: ['test', '1s', 'linear'],
}]));

it('recognises keyframes', () => {
  const { managerArgs } = extractRules(`
    @keyframes test {
      start { opacity: 0 }
      end { opacity: 1 }
    }
  `);

  const { keyframesStyleTuples } = managerArgs;

  expect(keyframesStyleTuples).toEqual({
    test: [
      { time: 0, styleTuples: [['opacity', '0']] },
      { time: 1, styleTuples: [['opacity', '1']] },
    ],
  });
});

it('recognises multiple', () => {
  const { managerArgs } = extractRules(`
    @keyframes test1 {
      start { opacity: 0 }
      end { opacity: 1 }
    }

    @keyframes test2 {
      start { opacity: 0 }
      50% { opacity: 0.5 }
      end { opacity: 1 }
    }
  `);

  const { keyframesStyleTuples } = managerArgs;

  expect(keyframesStyleTuples).toEqual({
    test1: [
      { time: 0, styleTuples: [['opacity', '0']] },
      { time: 1, styleTuples: [['opacity', '1']] },
    ],
    test2: [
      { time: 0, styleTuples: [['opacity', '0']] },
      { time: 0.5, styleTuples: [['opacity', '0.5']] },
      { time: 1, styleTuples: [['opacity', '1']] },
    ],
  });
});

it('imports variables from keyframes', () => {
  const { managerArgs } = extractRules(`
    @keyframes test {
      start { color: var(--primary) }
    }
  `);

  const { importedVariables, keyframesStyleTuples } = managerArgs;

  expect(importedVariables).toEqual(['primary']);
  expect(keyframesStyleTuples).toEqual({
    test: [
      { time: 0, styleTuples: [['color', 'var(--primary)']] },
    ],
  });
});

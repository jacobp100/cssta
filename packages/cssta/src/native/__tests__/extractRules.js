/* eslint-disable flowtype/require-valid-file-annotation */
/* global jest it, expect */
const extractRules = require('../extractRules');

const runTestFor = (inputCss, rules = []) => {
  const { args: { ruleTuples: actualRules } } = extractRules(inputCss);
  expect(actualRules).toEqual(rules);
};

it('scopes top-level declarations', () => runTestFor(`
  color: red;
`, [{
  selector: '&',
  styleTuples: [['color', 'red']],
  exportedVariables: {},
  transitionParts: {},
  animationParts: null,
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
  transitionParts: {},
  animationParts: null,
}]));

it('scopes boolean attribute selectors', () => runTestFor(`
  &[@attribute] {
    color: red;
  }
`, [{
  selector: '&[*attribute]',
  styleTuples: [['color', 'red']],
  exportedVariables: {},
  transitionParts: {},
  animationParts: null,
}]));

it('scopes string attribute selectors', () => runTestFor(`
  &[@stringAttribute = "red"] {
    color: red;
  }
`, [{
  selector: '&[*stringAttribute = "red"]',
  styleTuples: [['color', 'red']],
  exportedVariables: {},
  transitionParts: {},
  animationParts: null,
}]));

it('scopes attribute selectors', () => runTestFor(`
  &[@booleanValue1] {
    color: red;
  }

  &[@booleanValue2] {
    color: green;
  }

  &[@stringValue1 = "a"] {
    color: red;
  }

  &[@stringValue1 = "b"] {
    color: green;
  }

  &[@stringValue2 = "c"] {
    color: blue;
  }
`, [{
  selector: '&[*booleanValue1]',
  styleTuples: [['color', 'red']],
  exportedVariables: {},
  transitionParts: {},
  animationParts: null,
}, {
  selector: '&[*booleanValue2]',
  styleTuples: [['color', 'green']],
  exportedVariables: {},
  transitionParts: {},
  animationParts: null,
}, {
  selector: '&[*stringValue1 = "a"]',
  styleTuples: [['color', 'red']],
  exportedVariables: {},
  transitionParts: {},
  animationParts: null,
}, {
  selector: '&[*stringValue1 = "b"]',
  styleTuples: [['color', 'green']],
  exportedVariables: {},
  transitionParts: {},
  animationParts: null,
}, {
  selector: '&[*stringValue2 = "c"]',
  styleTuples: [['color', 'blue']],
  exportedVariables: {},
  transitionParts: {},
  animationParts: null,
}]));

it('recognises variable declarations', () => runTestFor(`
  --color: red;
`, [{
  selector: '&',
  styleTuples: [],
  exportedVariables: {
    color: 'red',
  },
  transitionParts: {},
  animationParts: null,
}]));

it('recognises variable imports', () => runTestFor(`
  color: var(--color);
`, [{
  selector: '&',
  styleTuples: [['color', 'var(--color)']],
  exportedVariables: {},
  transitionParts: {},
  animationParts: null,
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
  transitionParts: {},
  animationParts: null,
}]));

it('recognises multiple variable imports', () => runTestFor(`
  margin: var(--large) var(--small);
`, [{
  selector: '&',
  styleTuples: [['margin', 'var(--large) var(--small)']],
  exportedVariables: {},
  transitionParts: {},
  animationParts: null,
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
  transitionParts: {},
  animationParts: null,
}]));

it('returns all imported variables without duplicates', () => {
  const { args } = extractRules(`
    color: var(--color);

    &[@inverted] {
      backgroundColor: var(--color);
      color: var(--background);
    }
  `);

  const { importedVariables } = args;

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
  transitionParts: {
    color: ['1s', 'linear'],
  },
  animationParts: null,
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
  transitionParts: {
    color: ['1s', 'linear'],
    transition: ['2s', 'ease-in-out'],
  },
  animationParts: null,
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
  transitionParts: {
    color: ['1s', 'linear'],
    transition: ['1s', 'linear'],
  },
  animationParts: null,
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
  transitionParts: {
    color: ['var(--time)', 'var(--easing)'],
  },
  animationParts: null,
}]));

it('recognises animations', () => runTestFor(`
  animation: test 1s linear;
`, [{
  selector: '&',
  styleTuples: [],
  exportedVariables: {},
  transitionParts: {},
  animationParts: ['test', '1s', 'linear'],
}]));

it('recognises keyframes', () => {
  const { args } = extractRules(`
    @keyframes test {
      start { opacity: 0 }
      end { opacity: 1 }
    }
  `);

  const { keyframesStyleTuples } = args;

  expect(keyframesStyleTuples).toEqual({
    test: [
      { time: 0, styleTuples: [['opacity', '0']] },
      { time: 1, styleTuples: [['opacity', '1']] },
    ],
  });
});

it('recognises multiple', () => {
  const { args } = extractRules(`
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

  const { keyframesStyleTuples } = args;

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
  const { args } = extractRules(`
    @keyframes test {
      start { color: var(--primary) }
    }
  `);

  const { importedVariables, keyframesStyleTuples } = args;

  expect(importedVariables).toEqual(['primary']);
  expect(keyframesStyleTuples).toEqual({
    test: [
      { time: 0, styleTuples: [['color', 'var(--primary)']] },
    ],
  });
});

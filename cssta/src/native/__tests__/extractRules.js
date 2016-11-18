/* global jest it, expect */
const extractRules = require('../extractRules');

const runTestFor = (inputCss, {
  rules = [],
  styleSheetBody = [],
  substitutionMap = {},
} = {}) => {
  const { rules: actualRules, styleSheetBody: actualStyleSheetBody } =
    extractRules(inputCss, substitutionMap);

  expect(rules).toEqual(actualRules);
  expect(styleSheetBody).toEqual(actualStyleSheetBody);
};

it('scopes top-level declarations', () => runTestFor(`
  color: red;
`, {
  rules: [{
    selector: '&',
    styleName: 'style1',
  }],
  styleSheetBody: {
    style1: { color: 'red' },
  },
}));

it('scopes multiple top-level declarations into one class', () => runTestFor(`
  color: red;
  borderLeftColor: green;
`, {
  rules: [{
    selector: '&',
    styleName: 'style1',
  }],
  styleSheetBody: {
    style1: {
      color: 'red',
      borderLeftColor: 'green',
    },
  },
}));

it('scopes boolean attribute selectors', () => runTestFor(`
  [attribute] {
    color: red;
  }
`, {
  rules: [{
    selector: '[attribute]',
    styleName: 'style1',
  }],
  styleSheetBody: {
    style1: { color: 'red' },
  },
}));

it('scopes string attribute selectors', () => runTestFor(`
  [stringAttribute = "red"] {
    color: red;
  }
`, {
  rules: [{
    selector: '[stringAttribute = "red"]',
    styleName: 'style1',
  }],
  styleSheetBody: {
    style1: { color: 'red' },
  },
}));

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
`, {
  rules: [{
    selector: '[booleanValue1]',
    styleName: 'style1',
  }, {
    selector: '[booleanValue2]',
    styleName: 'style2',
  }, {
    selector: '[stringValue1 = "a"]',
    styleName: 'style3',
  }, {
    selector: '[stringValue1 = "b"]',
    styleName: 'style4',
  }, {
    selector: '[stringValue2 = "c"]',
    styleName: 'style5',
  }],
  styleSheetBody: {
    style1: { color: 'red' },
    style2: { color: 'green' },
    style3: { color: 'red' },
    style4: { color: 'green' },
    style5: { color: 'blue' },
  },
}));

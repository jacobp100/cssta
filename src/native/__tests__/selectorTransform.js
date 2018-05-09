const {
  getValidatorSourceForSelector,
  createValidatorForSelector
} = require("../selectorTransform");

const baseRun = (validator, { valid = [], invalid = [] }) => {
  valid.forEach(props => {
    expect([validator(props), props]).toEqual([true, props]);
  });

  invalid.forEach(props => {
    expect([validator(props), props]).toEqual([false, props]);
  });
};

const runTest = (selector, options) => {
  baseRun(createValidatorForSelector(selector), options);
};

const runMediaQueryTest = (mediaQuery, options) => {
  baseRun(createValidatorForSelector("*", `${mediaQuery}`), options);
};

// Note that getRoot replaces @ with * (so it parses). We have to use * here.

it("creates a function that validates boolean attributes", () =>
  runTest("[*bool]", {
    valid: [{ bool: true }, { bool: true, otherAttribute: true }],
    invalid: [{}, { bool: false }, { otherAttribute: true }]
  }));

it("creates a function that validates string attributes", () =>
  runTest('[*string = "test"]', {
    valid: [{ string: "test" }, { string: "test", otherAttribute: true }],
    invalid: [{}, { string: "other" }, { otherAttribute: true }]
  }));

it("combines multiple validators", () =>
  runTest('[*bool][*string = "test"]', {
    valid: [
      { bool: true, string: "test" },
      { bool: true, string: "test", otherAttribute: true }
    ],
    invalid: [
      {},
      { string: "test" },
      { bool: true },
      { string: "other", bool: true },
      { string: "test", bool: false },
      { otherAttribute: true }
    ]
  }));

it("validates everything for & selector", () =>
  runTest("&", {
    valid: [{}, { otherAttribute: true }]
  }));

it("works with :matches for same prop", () =>
  runTest(':matches([*string = "a"], [*string = "b"])', {
    valid: [
      { string: "a" },
      { string: "b" },
      { string: "a", otherAttribute: true }
    ],
    invalid: [{}, { string: "other" }, { otherAttribute: true }]
  }));

it("works with :matches for different props", () =>
  runTest(':matches([*string = "a"], [*bool])', {
    valid: [
      { string: "a" },
      { bool: true },
      { string: "a", otherAttribute: true }
    ],
    invalid: [
      {},
      { string: "other" },
      { bool: false },
      { otherAttribute: true }
    ]
  }));

it("works with :not for same prop", () =>
  runTest(':not([*string = "a"], [*string = "b"])', {
    valid: [{}, { string: "other" }, { otherAttribute: true }],
    invalid: [
      { string: "a" },
      { string: "b" },
      { string: "a", otherAttribute: true }
    ]
  }));

it("works with :not for different props", () =>
  runTest(':not([*string = "a"], [*bool])', {
    valid: [{}, { string: "other" }, { bool: false }, { otherAttribute: true }],
    invalid: [
      { string: "a" },
      { bool: true },
      { string: "a", otherAttribute: true }
    ]
  }));

it("works for min-width", () =>
  runMediaQueryTest("(min-width: 500)", {
    valid: [{ $ScreenWidth: 500 }, { $ScreenWidth: 501 }],
    invalid: [{ $ScreenWidth: 499 }]
  }));

it("works for max-width", () =>
  runMediaQueryTest("(max-width: 500)", {
    valid: [{ $ScreenWidth: 500 }, { $ScreenWidth: 499 }],
    invalid: [{ $ScreenWidth: 501 }]
  }));

it("works for width", () =>
  runMediaQueryTest("(width: 500)", {
    valid: [{ $ScreenWidth: 500 }],
    invalid: [{ $ScreenWidth: 501 }, { $ScreenWidth: 499 }]
  }));

it("works for min-height", () =>
  runMediaQueryTest("(min-height: 500)", {
    valid: [{ $ScreenHeight: 500 }, { $ScreenHeight: 501 }],
    invalid: [{ $ScreenHeight: 499 }]
  }));

it("works for max-height", () =>
  runMediaQueryTest("(max-height: 500)", {
    valid: [{ $ScreenHeight: 500 }, { $ScreenHeight: 499 }],
    invalid: [{ $ScreenHeight: 501 }]
  }));

it("works for height", () =>
  runMediaQueryTest("(height: 500)", {
    valid: [{ $ScreenHeight: 500 }],
    invalid: [{ $ScreenHeight: 501 }, { $ScreenHeight: 499 }]
  }));

it("works for aspect-ratio", () =>
  runMediaQueryTest("(aspect-ratio: 2 / 1)", {
    valid: [{ $ScreenWidth: 1000, $ScreenHeight: 500 }],
    invalid: [
      { $ScreenWidth: 1500, $ScreenHeight: 500 },
      { $ScreenWidth: 500, $ScreenHeight: 500 }
    ]
  }));

it("works for min-aspect-ratio", () =>
  runMediaQueryTest("(min-aspect-ratio: 2 / 1)", {
    valid: [
      { $ScreenWidth: 1000, $ScreenHeight: 500 },
      { $ScreenWidth: 1500, $ScreenHeight: 500 }
    ],
    invalid: [{ $ScreenWidth: 500, $ScreenHeight: 500 }]
  }));

it("works for max-aspect-ratio", () =>
  runMediaQueryTest("(max-aspect-ratio: 2 / 1)", {
    valid: [
      { $ScreenWidth: 1000, $ScreenHeight: 500 },
      { $ScreenWidth: 500, $ScreenHeight: 500 }
    ],
    invalid: [{ $ScreenWidth: 1500, $ScreenHeight: 500 }]
  }));

it("works for orientation landscape", () =>
  runMediaQueryTest("(orientation: landscape)", {
    valid: [{ $ScreenWidth: 1000, $ScreenHeight: 500 }],
    invalid: [{ $ScreenWidth: 500, $ScreenHeight: 1000 }]
  }));

it("works for orientation portrait", () =>
  runMediaQueryTest("(orientation: portrait)", {
    valid: [{ $ScreenWidth: 500, $ScreenHeight: 1000 }],
    invalid: [{ $ScreenWidth: 1000, $ScreenHeight: 500 }]
  }));

it("works for platform", () =>
  runMediaQueryTest("(platform: ios)", {
    valid: [{ $Platform: "ios" }],
    invalid: [{ $Platform: "android" }]
  }));

it("works for combined media queries", () =>
  runMediaQueryTest("(min-width: 500px) and (max-width: 600px)", {
    valid: [
      { $ScreenWidth: 500 },
      { $ScreenWidth: 501 },
      { $ScreenWidth: 599 },
      { $ScreenWidth: 600 }
    ],
    invalid: [{ $ScreenWidth: 499 }, { $ScreenWidth: 601 }]
  }));

it("works for comma delimited media queries", () =>
  runMediaQueryTest("(min-width: 500px), (orientation: landscape)", {
    valid: [
      { $ScreenWidth: 500, $ScreenHeight: 1000 },
      { $ScreenWidth: 501, $ScreenHeight: 1000 },
      { $ScreenWidth: 499, $ScreenHeight: 100 }
    ],
    invalid: [{ $ScreenWidth: 499, $ScreenHeight: 1000 }]
  }));

it("does not allow other pseudo selectors", () => {
  expect(() => createValidatorForSelector(":first-child")).toThrow();
});

it("creates function source for node", () => {
  const node = getValidatorSourceForSelector("&");
  expect(node).toEqual("(function(p) {return true;})");
});

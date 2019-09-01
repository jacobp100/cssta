const extractRules = require("../extractRules");

const styled = { test: String.raw };

const runTestFor = (inputCss, rules = []) => {
  const { ruleTuples: actualRules } = extractRules(inputCss);
  expect(actualRules).toEqual(rules);
};

it("scopes top-level declarations", () =>
  runTestFor(
    styled.test`
      color: red;
    `,
    [
      {
        selector: "&",
        mediaQuery: null,
        styleTuples: [["color", "red"]],
        exportedVariables: {},
        transitionParts: null,
        animationParts: null
      }
    ]
  ));

it("scopes multiple top-level declarations into one class", () =>
  runTestFor(
    styled.test`
      color: red;
      border-left-color: green;
    `,
    [
      {
        selector: "&",
        mediaQuery: null,
        styleTuples: [["color", "red"], ["border-left-color", "green"]],
        exportedVariables: {},
        transitionParts: null,
        animationParts: null
      }
    ]
  ));

it("scopes boolean attribute selectors", () =>
  runTestFor(
    styled.test`
      &[@attribute] {
        color: red;
      }
    `,
    [
      {
        selector: "&[cssta|attribute]",
        mediaQuery: null,
        styleTuples: [["color", "red"]],
        exportedVariables: {},
        transitionParts: null,
        animationParts: null
      }
    ]
  ));

it("scopes string attribute selectors", () =>
  runTestFor(
    styled.test`
      &[@stringAttribute="red"] {
        color: red;
      }
    `,
    [
      {
        selector: '&[cssta|stringAttribute="red"]',
        mediaQuery: null,
        styleTuples: [["color", "red"]],
        exportedVariables: {},
        transitionParts: null,
        animationParts: null
      }
    ]
  ));

it("scopes attribute selectors", () =>
  runTestFor(
    styled.test`
      &[@booleanValue1] {
        color: red;
      }

      &[@booleanValue2] {
        color: green;
      }

      &[@stringValue1="a"] {
        color: red;
      }

      &[@stringValue1="b"] {
        color: green;
      }

      &[@stringValue2="c"] {
        color: blue;
      }
    `,
    [
      {
        selector: "&[cssta|booleanValue1]",
        mediaQuery: null,
        styleTuples: [["color", "red"]],
        exportedVariables: {},
        transitionParts: null,
        animationParts: null
      },
      {
        selector: "&[cssta|booleanValue2]",
        mediaQuery: null,
        styleTuples: [["color", "green"]],
        exportedVariables: {},
        transitionParts: null,
        animationParts: null
      },
      {
        selector: '&[cssta|stringValue1="a"]',
        mediaQuery: null,
        styleTuples: [["color", "red"]],
        exportedVariables: {},
        transitionParts: null,
        animationParts: null
      },
      {
        selector: '&[cssta|stringValue1="b"]',
        mediaQuery: null,
        styleTuples: [["color", "green"]],
        exportedVariables: {},
        transitionParts: null,
        animationParts: null
      },
      {
        selector: '&[cssta|stringValue2="c"]',
        mediaQuery: null,
        styleTuples: [["color", "blue"]],
        exportedVariables: {},
        transitionParts: null,
        animationParts: null
      }
    ]
  ));

it("recognises variable declarations", () =>
  runTestFor(
    styled.test`
      --color: red;
    `,
    [
      {
        selector: "&",
        mediaQuery: null,
        styleTuples: [],
        exportedVariables: {
          color: "red"
        },
        transitionParts: null,
        animationParts: null
      }
    ]
  ));

it("recognises variable imports", () =>
  runTestFor(
    styled.test`
      color: var(--color);
    `,
    [
      {
        selector: "&",
        mediaQuery: null,
        styleTuples: [["color", "var(--color)"]],
        exportedVariables: {},
        transitionParts: null,
        animationParts: null
      }
    ]
  ));

it("recognises multiple variable declarations", () =>
  runTestFor(
    styled.test`
      --color: red;
      --color: blue;
      --other: green;
    `,
    [
      {
        selector: "&",
        mediaQuery: null,
        styleTuples: [],
        exportedVariables: {
          color: "blue",
          other: "green"
        },
        transitionParts: null,
        animationParts: null
      }
    ]
  ));

it("recognises multiple variable imports", () =>
  runTestFor(
    styled.test`
      margin: var(--large) var(--small);
    `,
    [
      {
        selector: "&",
        mediaQuery: null,
        styleTuples: [["margin", "var(--large) var(--small)"]],
        exportedVariables: {},
        transitionParts: null,
        animationParts: null
      }
    ]
  ));

it("mixes variable and style declarations", () =>
  runTestFor(
    styled.test`
      --color: red;
      color: var(--color);
    `,
    [
      {
        selector: "&",
        mediaQuery: null,
        styleTuples: [["color", "var(--color)"]],
        exportedVariables: {
          color: "red"
        },
        transitionParts: null,
        animationParts: null
      }
    ]
  ));

it("returns all imported variables without duplicates", () => {
  const { importedRuleVariables } = extractRules(`
    color: var(--color);

    &[@inverted] {
      backgroundColor: var(--color);
      color: var(--background);
    }
  `);

  expect(importedRuleVariables).toEqual(["color", "background"]);
});

it("recognises transitions", () =>
  runTestFor(
    styled.test`
      color: red;
      transition: color 1s linear;
    `,
    [
      {
        selector: "&",
        mediaQuery: null,
        styleTuples: [["color", "red"]],
        exportedVariables: {},
        transitionParts: {
          _: "color 1s linear"
        },
        animationParts: null
      }
    ]
  ));

it("recognises transitions using long hand", () =>
  runTestFor(
    styled.test`
      color: red;
      transition-property: color;
      transition-delay: 1s;
      transition-duration: 2s;
      transition-timing-function: linear;
    `,
    [
      {
        selector: "&",
        mediaQuery: null,
        styleTuples: [["color", "red"]],
        exportedVariables: {},
        transitionParts: {
          property: "color",
          delay: "1s",
          duration: "2s",
          timingFunction: "linear"
        },
        animationParts: null
      }
    ]
  ));

it("recognises multiple separate transitions", () =>
  runTestFor(
    styled.test`
      color: red;
      transform: scaleX(30deg);
      transition: color 1s linear, transform 2s ease-in-out;
    `,
    [
      {
        selector: "&",
        mediaQuery: null,
        styleTuples: [["color", "red"], ["transform", "scaleX(30deg)"]],
        exportedVariables: {},
        transitionParts: {
          _: "color 1s linear, transform 2s ease-in-out"
        },
        animationParts: null
      }
    ]
  ));

it("recognises multiple property transitions", () =>
  runTestFor(
    styled.test`
      color: red;
      transform: scaleX(30deg);
      transition: 1s linear;
      transition-property: color, transform;
    `,
    [
      {
        selector: "&",
        mediaQuery: null,
        styleTuples: [["color", "red"], ["transform", "scaleX(30deg)"]],
        exportedVariables: {},
        transitionParts: {
          _: "1s linear",
          property: "color, transform"
        },
        animationParts: null
      }
    ]
  ));

it("overrides previous transition declarations when using shorthand", () =>
  runTestFor(
    styled.test`
      color: red;
      transform: scaleX(30deg);
      transition-property: color, transform;
      transition-duration: 2s;
      transition: 1s linear;
    `,
    [
      {
        selector: "&",
        mediaQuery: null,
        styleTuples: [["color", "red"], ["transform", "scaleX(30deg)"]],
        exportedVariables: {},
        transitionParts: {
          _: "1s linear"
        },
        animationParts: null
      }
    ]
  ));

it("recognises multiple allows variables in transitions", () =>
  runTestFor(
    styled.test`
      color: red;
      transition: color var(--time) var(--easing);
    `,
    [
      {
        selector: "&",
        mediaQuery: null,
        styleTuples: [["color", "red"]],
        exportedVariables: {},
        transitionParts: {
          _: "color var(--time) var(--easing)"
        },
        animationParts: null
      }
    ]
  ));

it("recognises animations", () =>
  runTestFor(
    styled.test`
      animation: test 1s linear;
    `,
    [
      {
        selector: "&",
        mediaQuery: null,
        styleTuples: [],
        exportedVariables: {},
        transitionParts: null,
        animationParts: { _: "test 1s linear" }
      }
    ]
  ));

it("recognises animation long hands", () =>
  runTestFor(
    styled.test`
      animation-name: test;
      animation-duration: 1s;
      animation-delay: 2s;
      animation-iteration-count: 3;
      animation-timing-function: linear;
    `,
    [
      {
        selector: "&",
        mediaQuery: null,
        styleTuples: [],
        exportedVariables: {},
        transitionParts: null,
        animationParts: {
          name: "test",
          duration: "1s",
          delay: "2s",
          iterations: "3",
          timingFunction: "linear"
        }
      }
    ]
  ));

it("overrides previous animation declarations when using shorthand", () =>
  runTestFor(
    styled.test`
      color: red;
      animation-delay: 2s;
      animation-iteration-count: 3;
      animation-timing-function: linear;
      animation: test 1s;
    `,
    [
      {
        selector: "&",
        mediaQuery: null,
        styleTuples: [["color", "red"]],
        exportedVariables: {},
        transitionParts: null,
        animationParts: {
          _: "test 1s"
        }
      }
    ]
  ));

it("recognises keyframes", () => {
  const { keyframesStyleTuples } = extractRules(`
    @keyframes test {
      start { opacity: 0 }
      end { opacity: 1 }
    }
  `);

  expect(keyframesStyleTuples).toEqual({
    test: [
      { time: 0, styleTuples: [["opacity", "0"]] },
      { time: 1, styleTuples: [["opacity", "1"]] }
    ]
  });
});

it("recognises multiple keyframes", () => {
  const { keyframesStyleTuples } = extractRules(`
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

  expect(keyframesStyleTuples).toEqual({
    test1: [
      { time: 0, styleTuples: [["opacity", "0"]] },
      { time: 1, styleTuples: [["opacity", "1"]] }
    ],
    test2: [
      { time: 0, styleTuples: [["opacity", "0"]] },
      { time: 0.5, styleTuples: [["opacity", "0.5"]] },
      { time: 1, styleTuples: [["opacity", "1"]] }
    ]
  });
});

it("imports variables from keyframes", () => {
  const { importedKeyframeVariables, keyframesStyleTuples } = extractRules(`
    @keyframes test {
      start { color: var(--primary) }
    }
  `);

  expect(importedKeyframeVariables).toEqual(["primary"]);
  expect(keyframesStyleTuples).toEqual({
    test: [{ time: 0, styleTuples: [["color", "var(--primary)"]] }]
  });
});

it("recognises media queries for top-level declarations", () =>
  runTestFor(
    styled.test`
      @media (min-width: 500px) {
        color: red;
      }
    `,
    [
      {
        selector: "&",
        mediaQuery: "(min-width: 500px)",
        styleTuples: [["color", "red"]],
        exportedVariables: {},
        transitionParts: null,
        animationParts: null
      }
    ]
  ));

it("recognises media queries for nested rules", () =>
  runTestFor(
    styled.test`
      @media (min-width: 500px) {
        &[@prop] {
          color: red;
        }
      }
    `,
    [
      {
        selector: "&[cssta|prop]",
        mediaQuery: "(min-width: 500px)",
        styleTuples: [["color", "red"]],
        exportedVariables: {},
        transitionParts: null,
        animationParts: null
      }
    ]
  ));

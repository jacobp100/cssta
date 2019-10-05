import extractRules from "../extractRules";
import { StyleType } from "../types";

const styled = { test: String.raw };

it("scopes top-level declarations", () => {
  const css = styled.test`
    color: red;
  `;
  const rules = extractRules(css);
  expect(rules.propTypes).toEqual({});
  expect(rules.styles).toEqual([
    {
      type: StyleType.Tuples,
      condition: null,
      styleTuples: [["color", "red"]],
      importedVariables: []
    }
  ]);
  expect(rules.transitions).toEqual([]);
  expect(rules.animations).toEqual([]);
  expect(rules.keyframes).toEqual([]);
  expect(rules.exportedVariables).toEqual([]);
});

it("scopes multiple top-level declarations into one class", () => {
  const css = styled.test`
    color: red;
    border-left-color: green;
  `;
  const rules = extractRules(css);
  expect(rules.propTypes).toEqual({});
  expect(rules.styles).toEqual([
    {
      type: StyleType.Tuples,
      condition: null,
      styleTuples: [["color", "red"], ["border-left-color", "green"]],
      importedVariables: []
    }
  ]);
  expect(rules.transitions).toEqual([]);
  expect(rules.animations).toEqual([]);
  expect(rules.keyframes).toEqual([]);
  expect(rules.exportedVariables).toEqual([]);
});

it("scopes boolean attribute selectors", () => {
  const css = styled.test`
    &[@attribute] {
      color: red;
    }
  `;
  const rules = extractRules(css);
  expect(rules.propTypes).toEqual({ attribute: { type: "bool" } });
  expect(rules.styles).toEqual([
    {
      type: StyleType.Tuples,
      condition: { selector: "&[cssta|attribute]", mediaQuery: null },
      styleTuples: [["color", "red"]],
      importedVariables: []
    }
  ]);
  expect(rules.transitions).toEqual([]);
  expect(rules.animations).toEqual([]);
  expect(rules.keyframes).toEqual([]);
  expect(rules.exportedVariables).toEqual([]);
});

it("scopes string attribute selectors", () => {
  const css = styled.test`
    &[@stringAttribute="red"] {
      color: red;
    }
  `;
  const rules = extractRules(css);
  expect(rules.propTypes).toEqual({
    stringAttribute: { type: "oneOf", values: ["red"] }
  });
  expect(rules.styles).toEqual([
    {
      type: StyleType.Tuples,
      condition: {
        selector: '&[cssta|stringAttribute="red"]',
        mediaQuery: null
      },
      styleTuples: [["color", "red"]],
      importedVariables: []
    }
  ]);
  expect(rules.transitions).toEqual([]);
  expect(rules.animations).toEqual([]);
  expect(rules.keyframes).toEqual([]);
  expect(rules.exportedVariables).toEqual([]);
});

it("scopes attribute selectors", () => {
  const css = styled.test`
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
  `;
  const rules = extractRules(css);
  expect(rules.propTypes).toEqual({
    booleanValue1: { type: "bool" },
    booleanValue2: { type: "bool" },
    stringValue1: { type: "oneOf", values: ["a", "b"] },
    stringValue2: { type: "oneOf", values: ["c"] }
  });
  expect(rules.styles).toMatchInlineSnapshot(`
    Array [
      Object {
        "condition": Object {
          "mediaQuery": null,
          "selector": "&[cssta|booleanValue1]",
        },
        "importedVariables": Array [],
        "styleTuples": Array [
          Array [
            "color",
            "red",
          ],
        ],
        "type": 0,
      },
      Object {
        "condition": Object {
          "mediaQuery": null,
          "selector": "&[cssta|booleanValue2]",
        },
        "importedVariables": Array [],
        "styleTuples": Array [
          Array [
            "color",
            "green",
          ],
        ],
        "type": 0,
      },
      Object {
        "condition": Object {
          "mediaQuery": null,
          "selector": "&[cssta|stringValue1=\\"a\\"]",
        },
        "importedVariables": Array [],
        "styleTuples": Array [
          Array [
            "color",
            "red",
          ],
        ],
        "type": 0,
      },
      Object {
        "condition": Object {
          "mediaQuery": null,
          "selector": "&[cssta|stringValue1=\\"b\\"]",
        },
        "importedVariables": Array [],
        "styleTuples": Array [
          Array [
            "color",
            "green",
          ],
        ],
        "type": 0,
      },
      Object {
        "condition": Object {
          "mediaQuery": null,
          "selector": "&[cssta|stringValue2=\\"c\\"]",
        },
        "importedVariables": Array [],
        "styleTuples": Array [
          Array [
            "color",
            "blue",
          ],
        ],
        "type": 0,
      },
    ]
  `);
  expect(rules.transitions).toEqual([]);
  expect(rules.animations).toEqual([]);
  expect(rules.keyframes).toEqual([]);
  expect(rules.exportedVariables).toEqual([]);
});

it("recognises variable declarations", () => {
  const css = styled.test`
    --color: red;
  `;
  const rules = extractRules(css);
  expect(rules.propTypes).toEqual({});
  expect(rules.styles).toEqual([]);
  expect(rules.transitions).toEqual([]);
  expect(rules.animations).toEqual([]);
  expect(rules.keyframes).toEqual([]);
  expect(rules.exportedVariables).toEqual([
    { condition: null, name: "color", value: "red", importedVariables: [] }
  ]);
});

it("recognises variable imports", () => {
  const css = styled.test`
    color: var(--color);
  `;
  const rules = extractRules(css);
  expect(rules.propTypes).toEqual({});
  expect(rules.styles).toEqual([
    {
      type: StyleType.Tuples,
      condition: null,
      styleTuples: [["color", "var(--color)"]],
      importedVariables: ["color"]
    }
  ]);
  expect(rules.transitions).toEqual([]);
  expect(rules.animations).toEqual([]);
  expect(rules.keyframes).toEqual([]);
  expect(rules.exportedVariables).toEqual([]);
});

it("recognises multiple variable declarations", () => {
  const css = styled.test`
    --color: red;
    --color: blue;
    --other: green;
  `;
  const rules = extractRules(css);
  expect(rules.propTypes).toEqual({});
  expect(rules.styles).toEqual([]);
  expect(rules.transitions).toEqual([]);
  expect(rules.animations).toEqual([]);
  expect(rules.keyframes).toEqual([]);
  expect(rules.exportedVariables).toEqual([
    { condition: null, name: "color", value: "red", importedVariables: [] },
    { condition: null, name: "color", value: "blue", importedVariables: [] },
    { condition: null, name: "other", value: "green", importedVariables: [] }
  ]);
});

it("recognises multiple variable imports", () => {
  const css = styled.test`
    margin: var(--large) var(--small);
  `;
  const rules = extractRules(css);
  expect(rules.propTypes).toEqual({});
  expect(rules.styles).toEqual([
    {
      type: StyleType.Tuples,
      condition: null,
      styleTuples: [["margin", "var(--large) var(--small)"]],
      importedVariables: ["large", "small"]
    }
  ]);
  expect(rules.transitions).toEqual([]);
  expect(rules.animations).toEqual([]);
  expect(rules.keyframes).toEqual([]);
  expect(rules.exportedVariables).toEqual([]);
});

it("mixes variable and style declarations", () => {
  const css = styled.test`
    --color: red;
    color: var(--color);
  `;
  const rules = extractRules(css);
  expect(rules.propTypes).toEqual({});
  expect(rules.styles).toEqual([
    {
      type: StyleType.Tuples,
      condition: null,
      styleTuples: [["color", "var(--color)"]],
      importedVariables: ["color"]
    }
  ]);
  expect(rules.transitions).toEqual([]);
  expect(rules.animations).toEqual([]);
  expect(rules.keyframes).toEqual([]);
  expect(rules.exportedVariables).toEqual([
    { condition: null, name: "color", value: "red", importedVariables: [] }
  ]);
});

it("recognises transitions", () => {
  const css = styled.test`
    transition: color 1s linear;
  `;
  const rules = extractRules(css);
  expect(rules.propTypes).toEqual({});
  expect(rules.styles).toEqual([]);
  expect(rules.transitions).toEqual([
    { condition: null, part: { _: "color 1s linear" }, importedVariables: [] }
  ]);
  expect(rules.animations).toEqual([]);
  expect(rules.keyframes).toEqual([]);
  expect(rules.exportedVariables).toEqual([]);
});

it("recognises transitions using long hand", () => {
  const css = styled.test`
    transition-property: color;
    transition-delay: 1s;
    transition-duration: 2s;
    transition-timing-function: linear;
  `;
  const rules = extractRules(css);
  expect(rules.propTypes).toEqual({});
  expect(rules.styles).toEqual([]);
  expect(rules.transitions).toEqual([
    {
      condition: null,
      part: {
        property: "color",
        delay: "1s",
        duration: "2s",
        timingFunction: "linear"
      },
      importedVariables: []
    }
  ]);
  expect(rules.animations).toEqual([]);
  expect(rules.keyframes).toEqual([]);
  expect(rules.exportedVariables).toEqual([]);
});

it("recognises multiple separate transitions", () => {
  const css = styled.test`
    transition: color 1s linear, transform 2s ease-in-out;
  `;
  const rules = extractRules(css);
  expect(rules.propTypes).toEqual({});
  expect(rules.styles).toEqual([]);
  expect(rules.transitions).toEqual([
    {
      condition: null,
      part: { _: "color 1s linear, transform 2s ease-in-out" },
      importedVariables: []
    }
  ]);
  expect(rules.animations).toEqual([]);
  expect(rules.keyframes).toEqual([]);
  expect(rules.exportedVariables).toEqual([]);
});

it("recognises multiple property transitions", () => {
  const css = styled.test`
    transition: 1s linear;
    transition-property: color, transform;
  `;
  const rules = extractRules(css);
  expect(rules.propTypes).toEqual({});
  expect(rules.styles).toEqual([]);
  expect(rules.transitions).toEqual([
    {
      condition: null,
      part: { _: "1s linear", property: "color, transform" },
      importedVariables: []
    }
  ]);
  expect(rules.animations).toEqual([]);
  expect(rules.keyframes).toEqual([]);
  expect(rules.exportedVariables).toEqual([]);
});

it("overrides previous transition declarations when using shorthand", () => {
  const css = styled.test`
    transition-property: color, transform;
    transition-duration: 2s;
    transition: 1s linear;
  `;
  const rules = extractRules(css);
  expect(rules.propTypes).toEqual({});
  expect(rules.styles).toEqual([]);
  expect(rules.transitions).toEqual([
    {
      condition: null,
      part: { _: "1s linear" },
      importedVariables: []
    }
  ]);
  expect(rules.animations).toEqual([]);
  expect(rules.keyframes).toEqual([]);
  expect(rules.exportedVariables).toEqual([]);
});

it("recognises multiple allows variables in transitions", () => {
  const css = styled.test`
    transition: color var(--time) var(--easing);
  `;
  const rules = extractRules(css);
  expect(rules.propTypes).toEqual({});
  expect(rules.styles).toEqual([]);
  expect(rules.transitions).toEqual([
    {
      condition: null,
      part: { _: "color var(--time) var(--easing)" },
      importedVariables: ["time", "easing"]
    }
  ]);
  expect(rules.animations).toEqual([]);
  expect(rules.keyframes).toEqual([]);
  expect(rules.exportedVariables).toEqual([]);
});

it("recognises animations", () => {
  const css = styled.test`
    animation: test 1s linear;
  `;
  const rules = extractRules(css);
  expect(rules.propTypes).toEqual({});
  expect(rules.styles).toEqual([]);
  expect(rules.transitions).toEqual([]);
  expect(rules.animations).toEqual([
    {
      condition: null,
      part: { _: "test 1s linear" },
      importedVariables: []
    }
  ]);
  expect(rules.keyframes).toEqual([]);
  expect(rules.exportedVariables).toEqual([]);
});

it("recognises animation long hands", () => {
  const css = styled.test`
    animation-name: test;
    animation-duration: 1s;
    animation-delay: 2s;
    animation-iteration-count: 3;
    animation-timing-function: linear;
  `;
  const rules = extractRules(css);
  expect(rules.propTypes).toEqual({});
  expect(rules.styles).toEqual([]);
  expect(rules.transitions).toEqual([]);
  expect(rules.animations).toEqual([
    {
      condition: null,
      part: {
        name: "test",
        duration: "1s",
        delay: "2s",
        iterations: "3",
        timingFunction: "linear"
      },
      importedVariables: []
    }
  ]);
  expect(rules.keyframes).toEqual([]);
  expect(rules.exportedVariables).toEqual([]);
});

it("overrides previous animation declarations when using shorthand", () => {
  const css = styled.test`
    animation-delay: 2s;
    animation-iteration-count: 3;
    animation-timing-function: linear;
    animation: test 1s;
  `;
  const rules = extractRules(css);
  expect(rules.propTypes).toEqual({});
  expect(rules.styles).toEqual([]);
  expect(rules.transitions).toEqual([]);
  expect(rules.animations).toEqual([
    {
      condition: null,
      part: { _: "test 1s" },
      importedVariables: []
    }
  ]);
  expect(rules.keyframes).toEqual([]);
  expect(rules.exportedVariables).toEqual([]);
});

it("recognises keyframes", () => {
  const { keyframes } = extractRules(`
    @keyframes test {
      from { opacity: 0 }
      to { opacity: 1 }
    }
  `);

  expect(keyframes).toEqual([
    {
      name: "test",
      sequence: [
        { time: 0, styleTuples: [["opacity", "0"]] },
        { time: 1, styleTuples: [["opacity", "1"]] }
      ],
      importedVariables: []
    }
  ]);
});

it("recognises multiple keyframes", () => {
  const { keyframes } = extractRules(`
    @keyframes test1 {
      from { opacity: 0 }
      to { opacity: 1 }
    }

    @keyframes test2 {
      from { opacity: 0 }
      50% { opacity: 0.5 }
      to { opacity: 1 }
    }
  `);

  expect(keyframes).toEqual([
    {
      name: "test1",
      sequence: [
        { time: 0, styleTuples: [["opacity", "0"]] },
        { time: 1, styleTuples: [["opacity", "1"]] }
      ],
      importedVariables: []
    },
    {
      name: "test2",
      sequence: [
        { time: 0, styleTuples: [["opacity", "0"]] },
        { time: 0.5, styleTuples: [["opacity", "0.5"]] },
        { time: 1, styleTuples: [["opacity", "1"]] }
      ],
      importedVariables: []
    }
  ]);
});

it("imports variables from keyframes", () => {
  const { keyframes } = extractRules(`
    @keyframes test {
      from { color: var(--primary) }
    }
  `);

  expect(keyframes[0].sequence).toEqual([
    {
      time: 0,
      styleTuples: [["color", "var(--primary)"]]
    }
  ]);
  expect(keyframes[0].importedVariables).toEqual(["primary"]);
});

it("recognises media queries for top-level declarations", () => {
  const css = styled.test`
    @media (min-width: 500px) {
      color: red;
    }
  `;
  const rules = extractRules(css);
  expect(rules.propTypes).toEqual({});
  expect(rules.styles).toEqual([
    {
      type: StyleType.Tuples,
      condition: { selector: "&", mediaQuery: "(min-width: 500px)" },
      styleTuples: [["color", "red"]],
      importedVariables: []
    }
  ]);
  expect(rules.transitions).toEqual([]);
  expect(rules.animations).toEqual([]);
  expect(rules.keyframes).toEqual([]);
  expect(rules.exportedVariables).toEqual([]);
});

it("recognises media queries for nested rules", () => {
  const css = styled.test`
    @media (min-width: 500px) {
      &[@prop] {
        color: red;
      }
    }
  `;
  const rules = extractRules(css);
  expect(rules.propTypes).toEqual({ prop: { type: "bool" } });
  expect(rules.styles).toEqual([
    {
      type: StyleType.Tuples,
      condition: {
        selector: "&[cssta|prop]",
        mediaQuery: "(min-width: 500px)"
      },
      styleTuples: [["color", "red"]],
      importedVariables: []
    }
  ]);
  expect(rules.transitions).toEqual([]);
  expect(rules.animations).toEqual([]);
  expect(rules.keyframes).toEqual([]);
  expect(rules.exportedVariables).toEqual([]);
});

it("combines all options together", () => {
  const css = styled.test`
    color: red;

    &[@boolProp] {
      color: green;
      animation: var(--timing) someAnimation ease-in;
    }

    &[@someStringProp="1"] {
      transition: 3s;
      --someProp: 5px;
    }

    @keyframes someAnimation {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  `;
  expect(extractRules(css)).toMatchInlineSnapshot(`
    Object {
      "animations": Array [
        Object {
          "condition": Object {
            "mediaQuery": null,
            "selector": "&[cssta|boolProp]",
          },
          "importedVariables": Array [
            "timing",
          ],
          "part": Object {
            "_": "var(--timing) someAnimation ease-in",
          },
        },
      ],
      "exportedVariables": Array [
        Object {
          "condition": Object {
            "mediaQuery": null,
            "selector": "&[cssta|someStringProp=\\"1\\"]",
          },
          "importedVariables": Array [],
          "name": "someProp",
          "value": "5px",
        },
      ],
      "keyframes": Array [
        Object {
          "importedVariables": Array [],
          "name": "someAnimation",
          "sequence": Array [
            Object {
              "styleTuples": Array [
                Array [
                  "opacity",
                  "0",
                ],
              ],
              "time": 0,
            },
            Object {
              "styleTuples": Array [
                Array [
                  "opacity",
                  "1",
                ],
              ],
              "time": 1,
            },
          ],
        },
      ],
      "propTypes": Object {
        "boolProp": Object {
          "type": "bool",
        },
        "someStringProp": Object {
          "type": "oneOf",
          "values": Array [
            "1",
          ],
        },
      },
      "styles": Array [
        Object {
          "condition": null,
          "importedVariables": Array [],
          "styleTuples": Array [
            Array [
              "color",
              "red",
            ],
          ],
          "type": 0,
        },
        Object {
          "condition": Object {
            "mediaQuery": null,
            "selector": "&[cssta|boolProp]",
          },
          "importedVariables": Array [],
          "styleTuples": Array [
            Array [
              "color",
              "green",
            ],
          ],
          "type": 0,
        },
      ],
      "transitions": Array [
        Object {
          "condition": Object {
            "mediaQuery": null,
            "selector": "&[cssta|someStringProp=\\"1\\"]",
          },
          "importedVariables": Array [],
          "part": Object {
            "_": "3s",
          },
        },
      ],
    }
  `);
});

it("handles mixins", () => {
  const css = styled.test`
    @include someMixin;
  `;
  const rules = extractRules(css);
  expect(rules.propTypes).toEqual({});
  expect(rules.styles).toEqual([
    {
      type: StyleType.Mixin,
      condition: null,
      substitution: "someMixin"
    }
  ]);
  expect(rules.transitions).toEqual([]);
  expect(rules.animations).toEqual([]);
  expect(rules.keyframes).toEqual([]);
  expect(rules.exportedVariables).toEqual([]);
});

it("handles conditional mixins", () => {
  const css = styled.test`
    &[@cond] {
      @include someMixin;
    }
  `;
  const rules = extractRules(css);
  expect(rules.propTypes).toEqual({ cond: { type: "bool" } });
  expect(rules.styles).toEqual([
    {
      type: StyleType.Mixin,
      condition: { selector: "&[cssta|cond]", mediaQuery: null },
      substitution: "someMixin"
    }
  ]);
  expect(rules.transitions).toEqual([]);
  expect(rules.animations).toEqual([]);
  expect(rules.keyframes).toEqual([]);
  expect(rules.exportedVariables).toEqual([]);
});

it("handles mixins in media queries", () => {
  const css = styled.test`
    @media (min-width: 500px) {
      @include someMixin;
    }
  `;
  const rules = extractRules(css);
  expect(rules.propTypes).toEqual({});
  expect(rules.styles).toEqual([
    {
      type: StyleType.Mixin,
      condition: { selector: "&", mediaQuery: "(min-width: 500px)" },
      substitution: "someMixin"
    }
  ]);
  expect(rules.transitions).toEqual([]);
  expect(rules.animations).toEqual([]);
  expect(rules.keyframes).toEqual([]);
  expect(rules.exportedVariables).toEqual([]);
});

it("handles conditional mixins in media queries", () => {
  const css = styled.test`
    @media (min-width: 500px) {
      &[@cond] {
        @include someMixin;
      }
    }
  `;
  const rules = extractRules(css);
  expect(rules.propTypes).toEqual({ cond: { type: "bool" } });
  expect(rules.styles).toEqual([
    {
      type: StyleType.Mixin,
      condition: {
        selector: "&[cssta|cond]",
        mediaQuery: "(min-width: 500px)"
      },
      substitution: "someMixin"
    }
  ]);
  expect(rules.transitions).toEqual([]);
  expect(rules.animations).toEqual([]);
  expect(rules.keyframes).toEqual([]);
  expect(rules.exportedVariables).toEqual([]);
});

it("handles mixins within style tuples", () => {
  const css = styled.test`
    top: 10px;
    right: 10px;
    @include someMixin;
    bottom: 10px;
    left: var(--left);
  `;
  const rules = extractRules(css);
  expect(rules.propTypes).toEqual({});
  expect(rules.styles).toEqual([
    {
      type: StyleType.Tuples,
      condition: null,
      styleTuples: [["top", "10px"], ["right", "10px"]],
      importedVariables: []
    },
    {
      type: StyleType.Mixin,
      condition: null,
      substitution: "someMixin"
    },
    {
      type: StyleType.Tuples,
      condition: null,
      styleTuples: [["bottom", "10px"], ["left", "var(--left)"]],
      importedVariables: ["left"]
    }
  ]);
  expect(rules.transitions).toEqual([]);
  expect(rules.animations).toEqual([]);
  expect(rules.keyframes).toEqual([]);
  expect(rules.exportedVariables).toEqual([]);
});

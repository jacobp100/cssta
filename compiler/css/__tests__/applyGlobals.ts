import postcss from "postcss";
import { parseGlobals, applyGlobals } from "../applyGlobals";

test("Handles null/undefined", () => {
  expect(parseGlobals(null)).toEqual({
    vars: new Map(),
    conditions: [],
    globalVarsOnly: false
  });
  expect(parseGlobals(undefined)).toEqual({
    vars: new Map(),
    conditions: [],
    globalVarsOnly: false
  });
});

test("Handles objects", () => {
  expect(parseGlobals({ color: "red" })).toEqual({
    vars: new Map([["color", new Set([0])]]),
    conditions: [{ query: undefined, values: new Map([["color", "red"]]) }],
    globalVarsOnly: false
  });
  expect(parseGlobals({ color: "red", other: "green" })).toEqual({
    vars: new Map([
      ["color", new Set([0])],
      ["other", new Set([0])]
    ]),
    conditions: [
      {
        query: undefined,
        values: new Map([
          ["color", "red"],
          ["other", "green"]
        ])
      }
    ],
    globalVarsOnly: false
  });
});

test("Handles basic strings", () => {
  expect(
    parseGlobals(`
      --color: red;
    `)
  ).toEqual({
    vars: new Map([["color", new Set([0])]]),
    conditions: [{ query: undefined, values: new Map([["color", "red"]]) }],
    globalVarsOnly: false
  });
  expect(
    parseGlobals(`
      --color: red;
      --other: green;
    `)
  ).toEqual({
    vars: new Map([
      ["color", new Set([0])],
      ["other", new Set([0])]
    ]),
    conditions: [
      {
        query: undefined,
        values: new Map([
          ["color", "red"],
          ["other", "green"]
        ])
      }
    ],
    globalVarsOnly: false
  });
});

test("Handles strings with media queries", () => {
  expect(
    parseGlobals(`
      --color: red;

      @media (prefers-color-scheme: dark) {
        --color: green;
      }
    `)
  ).toEqual({
    vars: new Map([["color", new Set([0, 1])]]),
    conditions: [
      { query: undefined, values: new Map([["color", "red"]]) },
      {
        query: "(prefers-color-scheme: dark)",
        values: new Map([["color", "green"]])
      }
    ],
    globalVarsOnly: false
  });

  expect(
    parseGlobals(`
      --color: red;
      --other: green;
      
      @media (prefers-color-scheme: dark) {
        --color: green;
        --other: red;
      }
    `)
  ).toEqual({
    vars: new Map([
      ["color", new Set([0, 1])],
      ["other", new Set([0, 1])]
    ]),
    conditions: [
      {
        query: undefined,
        values: new Map([
          ["color", "red"],
          ["other", "green"]
        ])
      },
      {
        query: "(prefers-color-scheme: dark)",
        values: new Map([
          ["color", "green"],
          ["other", "red"]
        ])
      }
    ],
    globalVarsOnly: false
  });

  expect(
    parseGlobals(`
      --color: red;
      --other: green;
      
      @media (prefers-color-scheme: dark) {
        --color: green;
      }
    `)
  ).toEqual({
    vars: new Map([
      ["color", new Set([0, 1])],
      ["other", new Set([0])]
    ]),
    conditions: [
      {
        query: undefined,
        values: new Map([
          ["color", "red"],
          ["other", "green"]
        ])
      },
      {
        query: "(prefers-color-scheme: dark)",
        values: new Map([["color", "green"]])
      }
    ],
    globalVarsOnly: false
  });
});

test("Applying non-conditional globals", () => {
  const globals = {
    vars: new Map([["color", new Set([0])]]),
    conditions: [{ query: undefined, values: new Map([["color", "red"]]) }],
    globalVarsOnly: false
  };

  const root = postcss.parse(`
    .someRule {
      color: var(--color);
    }
  `);
  applyGlobals(root, globals);
  expect(root.toString()).toMatchInlineSnapshot(`
    "
        .someRule {
          color: red;
        }
      "
  `);
});

test("Applying non-conditional globals with other values", () => {
  const globals = {
    vars: new Map([["color", new Set([0])]]),
    conditions: [{ query: undefined, values: new Map([["color", "red"]]) }],
    globalVarsOnly: false
  };

  const root = postcss.parse(`
    .someRule {
      background: url(some-url) var(--color);
    }
  `);
  applyGlobals(root, globals);
  expect(root.toString()).toMatchInlineSnapshot(`
    "
        .someRule {
          background: url(some-url) red;
        }
      "
  `);
});

test("Applying non-conditional globals with multiple rules", () => {
  const globals = {
    vars: new Map([["color", new Set([0])]]),
    conditions: [{ query: undefined, values: new Map([["color", "red"]]) }],
    globalVarsOnly: false
  };

  const root = postcss.parse(`
    .someRule {
      background: url(some-url) var(--color);
    }

    .someOtherRule {
      background: url(some-url) var(--color);
    }
  `);
  applyGlobals(root, globals);
  expect(root.toString()).toMatchInlineSnapshot(`
    "
        .someRule {
          background: url(some-url) red;
        }

        .someOtherRule {
          background: url(some-url) red;
        }
      "
  `);
});

test("Applying conditional globals", () => {
  const globals = {
    vars: new Map([["color", new Set([0, 1])]]),
    conditions: [
      { query: undefined, values: new Map([["color", "red"]]) },
      {
        query: "(prefers-color-scheme: dark)",
        values: new Map([["color", "green"]])
      }
    ],
    globalVarsOnly: false
  };

  const root = postcss.parse(`
    .someRule {
      color: var(--color);
    }
  `);
  applyGlobals(root, globals);
  expect(root.toString()).toMatchInlineSnapshot(`
    "
        .someRule {
          color: red;
        }
    @media (prefers-color-scheme: dark) {
        .someRule {
          color: green;
        }
    }
      "
  `);
});

test("Applying conditional globals with other non-var decls", () => {
  const globals = {
    vars: new Map([["color", new Set([0, 1])]]),
    conditions: [
      { query: undefined, values: new Map([["color", "red"]]) },
      {
        query: "(prefers-color-scheme: dark)",
        values: new Map([["color", "green"]])
      }
    ],
    globalVarsOnly: false
  };

  const root = postcss.parse(`
    .someRule {
      notVar: something;
      color: var(--color);
      alsoNotVar: something else;
    }
  `);
  applyGlobals(root, globals);
  expect(root.toString()).toMatchInlineSnapshot(`
    "
        .someRule {
          notVar: something;
          color: red;
          alsoNotVar: something else;
        }
    @media (prefers-color-scheme: dark) {
        .someRule {
          notVar: something;
          color: green;
          alsoNotVar: something else;
        }
    }
      "
  `);
});

test("Applying conditional globals inside media queries", () => {
  const globals = {
    vars: new Map([["color", new Set([0, 1])]]),
    conditions: [
      { query: undefined, values: new Map([["color", "red"]]) },
      {
        query: "(prefers-color-scheme: dark)",
        values: new Map([["color", "green"]])
      }
    ],
    globalVarsOnly: false
  };

  const root = postcss.parse(`
    .someRule {
      color: var(--color);
    }

    @media (platform: ios) {
      .someRule {
        background: var(--color);
        color: orange;
      }
    }

    @media (platform: ios), (platform: android) {
      .someRule {
        border-color: var(--color);
      }
    }
  `);
  applyGlobals(root, globals);
  expect(root.toString()).toMatchInlineSnapshot(`
    "
        .someRule {
          color: red;
        }
    @media (prefers-color-scheme: dark) {
        .someRule {
          color: green;
        }
    }

        @media (platform: ios) {
          .someRule {
            background: red;
            color: orange;
          }
        }

        @media (platform: ios) and (prefers-color-scheme: dark) {
          .someRule {
            background: green;
            color: orange;
          }
    }

        @media (platform: ios), (platform: android) {
          .someRule {
            border-color: red;
          }
        }

        @media (platform: ios) and (prefers-color-scheme: dark), (platform: android) and (prefers-color-scheme: dark) {
          .someRule {
            border-color: green;
          }
    }
      "
  `);
});

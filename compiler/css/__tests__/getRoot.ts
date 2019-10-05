import postcss from "postcss";
import getRoot from "../getRoot";

const styled = { test: String.raw };

const stringifyRoot = (root: any) => {
  root.cleanRaws();
  root.walkRules((node: any) => {
    node.raws.semicolon = true;
  });
  return root.toString();
};

const runTestFor = (
  inputCss: string,
  expectedCss = inputCss.replace(/(\[\s*)@(\w)/g, "$1cssta|$2"),
  expectedPropTypes = {},
  allowCombinators = false
) => {
  const expectedRoot = postcss.parse(expectedCss);

  const { root: actualRoot, propTypes: actualPropTypes } = getRoot(
    inputCss,
    allowCombinators
  );

  expect(stringifyRoot(actualRoot)).toBe(stringifyRoot(expectedRoot));
  expect(actualPropTypes).toEqual(expectedPropTypes);
};

const shouldThrow = (inputCss: string) => {
  expect(() => getRoot(inputCss)).toThrow();
};

it("nests top-level declarations", () => {
  runTestFor(
    styled.test`
      color: red;
    `,
    styled.test`
      & {
        color: red;
      }
    `
  );
});

it("nests top-level mixins", () => {
  runTestFor(
    styled.test`
      @include someMixin;
    `,
    styled.test`
      & {
        @include someMixin;
      }
    `
  );
});

it("nests within @-rules", () => {
  runTestFor(
    styled.test`
      @supports (color: red) {
        color: red;
      }

      @media (screen) {
        color: green;
      }
    `,
    styled.test`
      @supports (color: red) {
        & {
          color: red;
        }
      }

      @media (screen) {
        & {
          color: green;
        }
      }
    `
  );
});

it("does not re-nest nested rules", () => {
  runTestFor(styled.test`
    & {
      color: red;
    }
  `);
});

it("requires nesting", () => {
  expect(() => {
    getRoot(":hover {}");
  }).toThrow();
  expect(() => {
    getRoot("[@attribute] {}");
  }).toThrow();
});

it("generates prop type for bool attributes", () => {
  runTestFor(
    styled.test`
      &[@attribute] {
        color: red;
      }
    `,
    undefined,
    { attribute: { type: "bool" } }
  );
});

it("generates prop type for string attributes", () => {
  runTestFor(
    styled.test`
      &[@attribute="1"] {
        color: red;
      }

      &[@attribute="2"] {
        color: red;
      }
    `,
    undefined,
    { attribute: { type: "oneOf", values: ["1", "2"] } }
  );
});

it("generates multile prop types for multiple attributes", () => {
  runTestFor(
    styled.test`
      &[@boolAttribute] {
        color: red;
      }

      &[@stringAttribute="1"] {
        color: red;
      }

      &[@stringAttribute="2"] {
        color: red;
      }
    `,
    undefined,
    {
      boolAttribute: { type: "bool" },
      stringAttribute: { type: "oneOf", values: ["1", "2"] }
    }
  );
});

it("only defines values for string attribute once", () => {
  runTestFor(
    styled.test`
      &[@attribute="1"] {
        color: red;
      }

      &[@attribute="1"] {
        color: red;
      }
    `,
    undefined,
    { attribute: { type: "oneOf", values: ["1"] } }
  );
});

it("does not nest declarations within keyframes", () => {
  runTestFor(styled.test`
    @keyframes test {
      color: red;
    }
  `);
});

it("does not nest nested rules", () => {
  runTestFor(styled.test`
    & {
      color: red;
    }
  `);
});

it("optionally allows combinators scoping with &", () => {
  runTestFor(
    styled.test`
      :fullscreen & {
        color: red;
      }
    `,
    undefined,
    undefined,
    true
  );
});

it("optionally allows combinators scoping with prop selectors", () => {
  runTestFor(
    styled.test`
      :fullscreen &[@attribute] {
        color: red;
      }
    `,
    undefined,
    { attribute: { type: "bool" } },
    true
  );
});

it("when allowing combinators, prop selectors must be tied to an &", () => {
  expect(() => {
    getRoot(
      styled.test`
        & [@prop] {
        }
      `
    );
  }).toThrow();
  expect(() => {
    getRoot(
      styled.test`
        :not(&[@prop]) {
        }
      `
    );
  }).toThrow();
});

it("does not allow combinators by default", () => {
  shouldThrow(styled.test`
    & & {
      color: red;
    }
  `);
});

it("does not allow combinators after scoping with &", () => {
  shouldThrow(styled.test`
    & :fullscreen {
      color: red;
    }
  `);
});

it("does not allow combinators after scoping with prop selectors", () => {
  shouldThrow(styled.test`
    &[@attribute] :fullscreen {
      color: red;
    }
  `);
});

it("does not allow case-insensitive attributes", () => {
  shouldThrow(styled.test`
    &[@attribute="value" i] {
      color: red;
    }
  `);
});

it("only allows = as operator in attribute", () => {
  shouldThrow(styled.test`
    &[@attribute~="value"] {
      color: red;
    }
  `);
});

it('does not allow attributes to be called "component"', () => {
  shouldThrow(styled.test`
    &[@component] {
      color: red;
    }
  `);
});

it("enforces consistent prop types", () => {
  shouldThrow(styled.test`
    &[@mixedAttribute] {
      color: red;
    }

    &[@mixedAttribute="value"] {
      color: red;
    }
  `);
});

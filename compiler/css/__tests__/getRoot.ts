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

it("Nests top-level declarations", () => {
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

it("Nests top-level mixins", () => {
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

it("Nests within @-rules", () => {
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

it("Does not re-nest nested rules", () => {
  runTestFor(styled.test`
    & {
      color: red;
    }
  `);
});

it("Requires nesting", () => {
  expect(() => {
    getRoot(":hover {}");
  }).toThrow();
  expect(() => {
    getRoot("[@attribute] {}");
  }).toThrow();
});

it("Generates prop type for bool attributes", () => {
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

it("Generates prop type for string attributes", () => {
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

it("Generates multile prop types for multiple attributes", () => {
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

it("Only defines values for string attribute once", () => {
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

it("Does not nest declarations within keyframes", () => {
  runTestFor(styled.test`
    @keyframes test {
      color: red;
    }
  `);
});

it("Does not nest nested rules", () => {
  runTestFor(styled.test`
    & {
      color: red;
    }
  `);
});

it("Optionally allows combinators scoping with &", () => {
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

it("Optionally allows combinators scoping with prop selectors", () => {
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

it("When allowing combinators, prop selectors must be tied to an &", () => {
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

it("Does not allow combinators by default", () => {
  shouldThrow(styled.test`
    & & {
      color: red;
    }
  `);
});

it("Does not allow combinators after scoping with &", () => {
  shouldThrow(styled.test`
    & :fullscreen {
      color: red;
    }
  `);
});

it("Does not allow combinators after scoping with prop selectors", () => {
  shouldThrow(styled.test`
    &[@attribute] :fullscreen {
      color: red;
    }
  `);
});

it("Does not allow case-insensitive attributes", () => {
  shouldThrow(styled.test`
    &[@attribute="value" i] {
      color: red;
    }
  `);
});

it("Only allows = as operator in attribute", () => {
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

it("Enforces consistent prop types", () => {
  shouldThrow(styled.test`
    &[@mixedAttribute] {
      color: red;
    }

    &[@mixedAttribute="value"] {
      color: red;
    }
  `);
});

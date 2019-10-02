const babel = require("@babel/core");
const { default: generate } = require("@babel/generator");
const selectorTransform = require("../selectorTransform");

const { types: t } = babel;

const run = (inputSelector, mediaQuery) => {
  const selector = inputSelector.replace(/@/g, "cssta|");
  const ast = babel.parse("const selector = () => {}");
  babel.traverse(ast, {
    ArrowFunctionExpression(path) {
      const node = selectorTransform(
        babel,
        path.get("body"),
        { selector, mediaQuery },
        { cache: {} }
      );
      path.get("body").pushContainer("body", t.returnStatement(node));
    }
  });
  const { code } = generate(ast);
  return code.replace(/"/g, "'");
};

it("Returns null for empty selector", () => {
  const returned = selectorTransform(
    babel,
    null,
    { selector: "&", mediaQuery: null },
    { cache: {} }
  );
  expect(returned).toBe(null);
});

it("Creates a boolean selector", () => {
  const code = run("&[@test]");
  expect(code).toMatchInlineSnapshot(`
    "const selector = () => {
      return test === true;
    };"
  `);
});

it("Creates a string selector", () => {
  const code = run('&[@test="test"]');
  expect(code).toMatchInlineSnapshot(`
    "const selector = () => {
      return test === 'test';
    };"
  `);
});

it("Combines two selectors", () => {
  const code = run('&[@test][@other="test"]');
  expect(code).toMatchInlineSnapshot(`
    "const selector = () => {
      return test === true && other === 'test';
    };"
  `);
});

it("Combines three selectors", () => {
  const code = run('&[@test][@other="test"][@another="testing"]');
  expect(code).toMatchInlineSnapshot(`
    "const selector = () => {
      return test === true && other === 'test' && another === 'testing';
    };"
  `);
});

it("Handles :not selectors for booleans", () => {
  const code = run("&:not([@test])");
  expect(code).toMatchInlineSnapshot(`
    "const selector = () => {
      return !(test === true);
    };"
  `);
});

it("Handles :not selectors for strings", () => {
  const code = run('&:not([@test="test"])');
  expect(code).toMatchInlineSnapshot(`
    "const selector = () => {
      return !(test === 'test');
    };"
  `);
});

it("Handles :not with combined selectors", () => {
  const code = run('&:not([@test][@other="test"])');
  expect(code).toMatchInlineSnapshot(`
    "const selector = () => {
      return !(test === true && other === 'test');
    };"
  `);
});

it("Handles combined regular and :not selectors", () => {
  const code = run('&[@test]:not([@other="test"])');
  expect(code).toMatchInlineSnapshot(`
    "const selector = () => {
      return test === true && !(other === 'test');
    };"
  `);
});

it("Handles :matches selectors", () => {
  const code = run('&:matches([@test="a"], [@test="b"], [@test="c"])');
  expect(code).toMatchInlineSnapshot(`
    "const selector = () => {
      return test === 'a' || test === 'b' || test === 'c';
    };"
  `);
});

it("Handles combined regular and :matches selectors", () => {
  const code = run(
    '&[@test]:matches([@other="a"], [@other="b"], [@other="c"])'
  );
  expect(code).toMatchInlineSnapshot(`
    "const selector = () => {
      return test === true && (other === 'a' || other === 'b' || other === 'c');
    };"
  `);
});

it("Throws on attribute selectors", () => {
  expect(() => {
    run("&[prop]");
  }).toThrow();
});

it("Throws on invalid :pseudo selectors", () => {
  expect(() => {
    run("&:pseudo()");
  }).toThrow();
});

it("Handles multiple selectors", () => {
  const code = run('&[@test], &[@other="c"]');
  expect(code).toMatchInlineSnapshot(`
    "const selector = () => {
      return test === true || other === 'c';
    };"
  `);
});

it("Handles sceen media queries", () => {
  expect(run("&", "(min-width: 500px)")).toMatchInlineSnapshot(`
    "import useMediaQuery from 'cssta/runtime/useMediaQuery';

    const selector = () => {
      const {
        width: screenWidth,
        height: screenHeight
      } = useMediaQuery();
      return screenWidth >= 500;
    };"
  `);
  expect(run("&", "(max-width: 500px)")).toMatchInlineSnapshot(`
    "import useMediaQuery from 'cssta/runtime/useMediaQuery';

    const selector = () => {
      const {
        width: screenWidth,
        height: screenHeight
      } = useMediaQuery();
      return screenWidth <= 500;
    };"
  `);
  expect(run("&", "(width: 500px)")).toMatchInlineSnapshot(`
    "import useMediaQuery from 'cssta/runtime/useMediaQuery';

    const selector = () => {
      const {
        width: screenWidth,
        height: screenHeight
      } = useMediaQuery();
      return screenWidth === 500;
    };"
  `);
  expect(run("&", "(min-height: 500px)")).toMatchInlineSnapshot(`
    "import useMediaQuery from 'cssta/runtime/useMediaQuery';

    const selector = () => {
      const {
        width: screenWidth,
        height: screenHeight
      } = useMediaQuery();
      return screenHeight >= 500;
    };"
  `);
  expect(run("&", "(max-height: 500px)")).toMatchInlineSnapshot(`
    "import useMediaQuery from 'cssta/runtime/useMediaQuery';

    const selector = () => {
      const {
        width: screenWidth,
        height: screenHeight
      } = useMediaQuery();
      return screenHeight <= 500;
    };"
  `);
  expect(run("&", "(height: 500px)")).toMatchInlineSnapshot(`
    "import useMediaQuery from 'cssta/runtime/useMediaQuery';

    const selector = () => {
      const {
        width: screenWidth,
        height: screenHeight
      } = useMediaQuery();
      return screenHeight === 500;
    };"
  `);
  expect(run("&", "(min-aspect-ratio: 16/9)")).toMatchInlineSnapshot(`
    "import useMediaQuery from 'cssta/runtime/useMediaQuery';

    const selector = () => {
      const {
        width: screenWidth,
        height: screenHeight
      } = useMediaQuery();
      return 16 / 9 <= screenWidth / screenHeight;
    };"
  `);
  expect(run("&", "(max-aspect-ratio: 16/9)")).toMatchInlineSnapshot(`
    "import useMediaQuery from 'cssta/runtime/useMediaQuery';

    const selector = () => {
      const {
        width: screenWidth,
        height: screenHeight
      } = useMediaQuery();
      return 16 / 9 >= screenWidth / screenHeight;
    };"
  `);
  expect(run("&", "(aspect-ratio: 16/9)")).toMatchInlineSnapshot(`
    "import useMediaQuery from 'cssta/runtime/useMediaQuery';

    const selector = () => {
      const {
        width: screenWidth,
        height: screenHeight
      } = useMediaQuery();
      return 16 / 9 === screenWidth / screenHeight;
    };"
  `);
  expect(run("&", "(orientation: landscape)")).toMatchInlineSnapshot(`
    "import useMediaQuery from 'cssta/runtime/useMediaQuery';

    const selector = () => {
      const {
        width: screenWidth,
        height: screenHeight
      } = useMediaQuery();
      return screenWidth > screenHeight;
    };"
  `);
  expect(run("&", "(orientation: portrait)")).toMatchInlineSnapshot(`
    "import useMediaQuery from 'cssta/runtime/useMediaQuery';

    const selector = () => {
      const {
        width: screenWidth,
        height: screenHeight
      } = useMediaQuery();
      return screenWidth < screenHeight;
    };"
  `);
});

it("Handles color scheme media queries", () => {
  expect(run("&", "(prefers-color-scheme: dark)")).toMatchInlineSnapshot(`
    "import { useColorScheme } from 'react-native';

    const selector = () => {
      const colorScheme = useColorScheme();
      return colorScheme === 'dark';
    };"
  `);
  expect(run("&", "(prefers-color-scheme: light)")).toMatchInlineSnapshot(`
    "import { useColorScheme } from 'react-native';

    const selector = () => {
      const colorScheme = useColorScheme();
      return colorScheme === 'light';
    };"
  `);
});

it("Handles platform media queries", () => {
  expect(run("&", "(platform: ios)")).toMatchInlineSnapshot(`
    "import { Platform } from 'react-native';

    const selector = () => {
      return Platform.OS === 'ios';
    };"
  `);
  expect(run("&", "(platform: android)")).toMatchInlineSnapshot(`
    "import { Platform } from 'react-native';

    const selector = () => {
      return Platform.OS === 'android';
    };"
  `);
});

it("Throws when cannot parse media query", () => {
  expect(() => {
    run("&", "(not-a-query: no-it-isn't)");
  }).toThrow();
});

it("Handles intersection media queries", () => {
  const code = run("&", "(min-width: 500px) and (prefers-color-scheme: dark)");
  expect(code).toMatchInlineSnapshot(`
    "import useMediaQuery from 'cssta/runtime/useMediaQuery';
    import { useColorScheme } from 'react-native';

    const selector = () => {
      const {
        width: screenWidth,
        height: screenHeight
      } = useMediaQuery();
      const colorScheme = useColorScheme();
      return screenWidth >= 500 && colorScheme === 'dark';
    };"
  `);
});

it("Handles union media queries", () => {
  const code = run("&", "(min-width: 500px), (prefers-color-scheme: dark)");
  expect(code).toMatchInlineSnapshot(`
    "import useMediaQuery from 'cssta/runtime/useMediaQuery';
    import { useColorScheme } from 'react-native';

    const selector = () => {
      const {
        width: screenWidth,
        height: screenHeight
      } = useMediaQuery();
      const colorScheme = useColorScheme();
      return screenWidth >= 500 || colorScheme === 'dark';
    };"
  `);
});

it("Handles selectors with media queries", () => {
  const code = run("&[@test]", "(min-width: 500px)");
  expect(code).toMatchInlineSnapshot(`
    "import useMediaQuery from 'cssta/runtime/useMediaQuery';

    const selector = () => {
      const {
        width: screenWidth,
        height: screenHeight
      } = useMediaQuery();
      return test === true && screenWidth >= 500;
    };"
  `);
});

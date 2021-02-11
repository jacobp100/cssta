import * as babel from "@babel/core";
import generate from "@babel/generator";
import { styled } from "../__testUtil__";
import buildMixin from "../buildMixin";

const { types: t } = babel;

const build = (css: string, options = {}) => {
  const ast = babel.parse("const Example = 'replaceMe'");
  babel.traverse(ast, {
    StringLiteral(path) {
      if (path.node.value === "replaceMe") {
        buildMixin(
          babel,
          path,
          t.templateLiteral([t.templateElement({ raw: css, cooked: css })], []),
          options
        );
      }
    },
  });
  const { code } = generate(ast);
  return code.replace(/"/g, "'");
};

it("Supports mixins", () => {
  const css = styled.test`
    color: red;
  `;

  const code = build(css);
  expect(code).toMatchInlineSnapshot(`
    "const styles0 = {
      color: 'red'
    };

    const Example = () => {
      const style = styles0;
      return style;
    };"
  `);
});

it("Supports mixins with custom properties", () => {
  const css = styled.test`
    color: var(--red);
  `;

  const code = build(css);
  expect(code).toMatchInlineSnapshot(`
    "import useCustomProperties from 'cssta/runtime/useCustomProperties';
    import useCustomPropertyStyle from 'cssta/runtime/useCustomPropertyStyle';
    const unresolvedStyleTuples0 = [['color', 'var(--red)']];

    const Example = () => {
      const customProperties = useCustomProperties(null);
      const styles = useCustomPropertyStyle(unresolvedStyleTuples0, customProperties);
      const style = styles;
      return style;
    };"
  `);
});

it("Supports mixins with simple viewport units", () => {
  const css = styled.test`
    width: 20vw;
  `;

  const code = build(css);
  expect(code).toMatchInlineSnapshot(`
    "import useWindowDimensions from 'cssta/runtime/useWindowDimensions';

    const Example = () => {
      const {
        width: windowWidth,
        height: windowHeight
      } = useWindowDimensions();
      const baseStyle = {
        width: Number(windowWidth * 0.2)
      };
      const style = baseStyle;
      return style;
    };"
  `);
});

it("Supports mixins with shorthand viewport units", () => {
  const css = styled.test`
    margin: 20vw;
  `;

  const code = build(css);
  expect(code).toMatchInlineSnapshot(`
    "import useViewportStyle from 'cssta/runtime/useViewportStyle';
    const unresolvedStyleTuples0 = [['margin', '20vw']];

    const Example = () => {
      const styles0 = useViewportStyle(unresolvedStyleTuples0);
      const style = styles0;
      return style;
    };"
  `);
});

it("Throws on unsupported features", () => {
  expect(() => {
    build(styled.test`
      --exportedVar: something;
    `);
  }).toThrow();
  expect(() => {
    build(styled.test`
      transition: all 1s;
    `);
  }).toThrow();
  expect(() => {
    build(styled.test`
      animation: 1s someKeyframe;
    `);
  }).toThrow();
  expect(() => {
    build(styled.test`
      @keyframes someTest {
        0% {
          opacity: 0;
        }
        100% {
          opacity: 1;
        }
      }
    `);
  }).toThrow();
});

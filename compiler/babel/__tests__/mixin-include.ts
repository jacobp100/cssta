import * as babel from "@babel/core";
import generate from "@babel/generator";
import buildElement from "../buildElement";

it("Works with mixins", () => {
  const ast = babel.parse(`
    const Test = styled(Button)\`
      @include \${useStyles};
    \`;
  `);
  babel.traverse(ast, {
    TaggedTemplateExpression(path: any) {
      const { tag, quasi: body } = path.node;
      const element = tag.arguments[0];
      buildElement(babel, path, element, body, { jsx: true });
    }
  });
  const { code } = generate(ast);
  expect(code).toMatchInlineSnapshot(`
    "import React from \\"react\\";
    const Test = React.forwardRef((props, ref) => {
      const mixinInclude0 = useStyles();
      const style = props.style != null ? [mixinInclude0, props.style] : mixinInclude0;
      return <Button {...props} ref={ref} style={style} />;
    });"
  `);
});

it("Works with conditional mixins", () => {
  const ast = babel.parse(`
    const Test = styled(Button)\`
      &[@someTest] {
        @include \${useStyles};
      }
    \`;
  `);
  babel.traverse(ast, {
    TaggedTemplateExpression(path: any) {
      const { tag, quasi: body } = path.node;
      const element = tag.arguments[0];
      buildElement(babel, path, element, body, { jsx: true });
    }
  });
  const { code } = generate(ast);
  expect(code).toMatchInlineSnapshot(`
    "import React from \\"react\\";
    const Test = React.forwardRef(({
      someTest,
      ...props
    }, ref) => {
      const mixinInclude0 = useStyles();
      const baseStyle = someTest === true ? mixinInclude0 : null;
      const style = props.style != null ? [baseStyle, props.style] : baseStyle;
      return <Button {...props} ref={ref} style={style} />;
    });"
  `);
});

it("Works with multiple mixins", () => {
  const ast = babel.parse(`
    const Test = styled(Button)\`
      @include \${useStyles};

      &[@someTest] {
        @include \${useOtherStyles};
      }
    \`;
  `);
  babel.traverse(ast, {
    TaggedTemplateExpression(path: any) {
      const { tag, quasi: body } = path.node;
      const element = tag.arguments[0];
      buildElement(babel, path, element, body, { jsx: true });
    }
  });
  const { code } = generate(ast);
  expect(code).toMatchInlineSnapshot(`
    "import React from \\"react\\";
    const Test = React.forwardRef(({
      someTest,
      ...props
    }, ref) => {
      const mixinInclude0 = useStyles();
      const mixinInclude1 = useOtherStyles();
      const style = [mixinInclude0, someTest === true ? mixinInclude1 : null, props.style];
      return <Button {...props} ref={ref} style={style} />;
    });"
  `);
});

it("Gives sensible error message when using mixins incorrectly", () => {
  const ast = babel.parse(`
    const Test = styled(Button)\`
      @include notASubstitution
    \`;
  `);
  expect(() => {
    babel.traverse(ast, {
      TaggedTemplateExpression(path: any) {
        const { tag, quasi: body } = path.node;
        const element = tag.arguments[0];
        buildElement(babel, path, element, body, { jsx: true });
      }
    });
  }).toThrow("Mixins should use interpolation (e.g. @include ${useStyles})");
});

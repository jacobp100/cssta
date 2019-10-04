import * as babel from "@babel/core";
import generate from "@babel/generator";
import buildElement from "../buildElement";

it("Works with substititions", () => {
  const ast = babel.parse(
    "const Test = styled(Button)`" +
      "  color: ${red};" +
      "  margin: ${small};" +
      "  top: ${small};" +
      "  opacity: ${half};" +
      "`;"
  );
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
    import { transformStyleTuples } from \\"cssta/runtime/cssUtil\\";
    import { transformRawValue } from \\"cssta/runtime/cssUtil\\";
    const styles0 = Object.assign({
      color: String(red).trim()
    }, transformStyleTuples([[\\"margin\\", \`\${small}\`]]), {
      top: transformRawValue(small),
      opacity: Number(half)
    });
    const Test = React.forwardRef((props, ref) => {
      const style = props.style != null ? [styles0, props.style] : styles0;
      return <Button {...props} ref={ref} style={style} />;
    });"
  `);
});

it("Works with substititions and simple viewport units", () => {
  const ast = babel.parse(
    "const Test = styled(Button)`" +
      "  color: ${red};" +
      "  top: 10vw;" +
      "  opacity: ${something}" +
      "`;"
  );
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
    import useWindowDimensions from \\"cssta/runtime/useWindowDimensions\\";
    const Test = React.forwardRef((props, ref) => {
      const {
        width: windowWidth,
        height: windowHeight
      } = useWindowDimensions();
      const baseStyle = {
        color: String(red).trim(),
        top: Number(windowWidth * 0.1),
        opacity: Number(something)
      };
      const style = props.style != null ? [baseStyle, props.style] : baseStyle;
      return <Button {...props} ref={ref} style={style} />;
    });"
  `);
});

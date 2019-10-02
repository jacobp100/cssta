const babel = require("@babel/core");
const { default: generate } = require("@babel/generator");
const processNative = require("../build");

it("Works with existing React", () => {
  const ast = babel.parse(
    "import React from 'react';" +
      "const Test = styled(Button)`" +
      "  color: red" +
      "`;"
  );
  babel.traverse(ast, {
    TaggedTemplateExpression(path) {
      const { tag, quasi: body } = path.node;
      const element = tag.arguments[0];
      processNative(babel, path, {}, element, body, { jsx: true });
    }
  });
  const { code } = generate(ast);
  expect(code).toMatchInlineSnapshot(`
    "import React from 'react';
    const styles = {
      0: {
        color: \\"red\\"
      }
    };
    const Test = React.forwardRef((props, ref) => {
      const style = props.style != null ? [styles[0], props.style] : styles[0];
      return <Button {...props} ref={ref} style={style} />;
    });"
  `);
});

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
    TaggedTemplateExpression(path) {
      const { tag, quasi: body } = path.node;
      const element = tag.arguments[0];
      processNative(babel, path, {}, element, body, { jsx: true });
    }
  });
  const { code } = generate(ast);
  expect(code).toMatchInlineSnapshot(`
    "import React from \\"react\\";
    import { transformStyleTuples } from \\"cssta/runtime/cssUtil\\";
    import { transformRawValue } from \\"cssta/runtime/cssUtil\\";
    const styles = {
      0: Object.assign({
        color: String(red).trim()
      }, transformStyleTuples([[\\"margin\\", \`\${small}\`]]), {
        top: transformRawValue(small),
        opacity: Number(half)
      })
    };
    const Test = React.forwardRef((props, ref) => {
      const style = props.style != null ? [styles[0], props.style] : styles[0];
      return <Button {...props} ref={ref} style={style} />;
    });"
  `);
});

it("Works with multiple component definitions", () => {
  const ast = babel.parse(
    "const Test1 = styled(Button)`" +
      "  color: red;" +
      "`;" +
      "const Test2 = styled(Button)`" +
      "  color: red;" +
      "`;" +
      "const Test3 = styled(Button)`" +
      "  color: red;" +
      "`;" +
      "const Test4 = styled(Button)`" +
      "  color: red;" +
      "`;" +
      "const Test5 = styled(Button)`" +
      "  color: red;" +
      "`;"
  );
  babel.traverse(ast, {
    TaggedTemplateExpression(path) {
      const { tag, quasi: body } = path.node;
      const element = tag.arguments[0];
      processNative(babel, path, {}, element, body, { jsx: true });
    }
  });
  const { code } = generate(ast);
  expect(code).toMatchInlineSnapshot(`
    "import React from \\"react\\";
    const styles = {
      0: {
        color: \\"red\\"
      }
    };
    const Test1 = React.forwardRef((props, ref) => {
      const style = props.style != null ? [styles[0], props.style] : styles[0];
      return <Button {...props} ref={ref} style={style} />;
    });
    const styles1 = {
      0: {
        color: \\"red\\"
      }
    };
    const Test2 = React.forwardRef((props, ref) => {
      const style = props.style != null ? [styles1[0], props.style] : styles1[0];
      return <Button {...props} ref={ref} style={style} />;
    });
    const styles2 = {
      0: {
        color: \\"red\\"
      }
    };
    const Test3 = React.forwardRef((props, ref) => {
      const style = props.style != null ? [styles2[0], props.style] : styles2[0];
      return <Button {...props} ref={ref} style={style} />;
    });
    const styles3 = {
      0: {
        color: \\"red\\"
      }
    };
    const Test4 = React.forwardRef((props, ref) => {
      const style = props.style != null ? [styles3[0], props.style] : styles3[0];
      return <Button {...props} ref={ref} style={style} />;
    });
    const styles4 = {
      0: {
        color: \\"red\\"
      }
    };
    const Test5 = React.forwardRef((props, ref) => {
      const style = props.style != null ? [styles4[0], props.style] : styles4[0];
      return <Button {...props} ref={ref} style={style} />;
    });"
  `);
});

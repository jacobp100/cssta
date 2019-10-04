import * as babel from "@babel/core";
import generate from "@babel/generator";
import buildElement from "../buildElement";

it("Works with existing React", () => {
  const ast = babel.parse(
    "import React from 'react';" +
      "const Test = styled(Button)`" +
      "  color: red" +
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
    "import React from 'react';
    const styles0 = {
      color: \\"red\\"
    };
    const Test = React.forwardRef((props, ref) => {
      const style = props.style != null ? [styles0, props.style] : styles0;
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
    TaggedTemplateExpression(path: any) {
      const { tag, quasi: body } = path.node;
      const element = tag.arguments[0];
      buildElement(babel, path, element, body, { jsx: true });
    }
  });
  const { code } = generate(ast);
  expect(code).toMatchInlineSnapshot(`
    "import React from \\"react\\";
    const styles0 = {
      color: \\"red\\"
    };
    const Test1 = React.forwardRef((props, ref) => {
      const style = props.style != null ? [styles0, props.style] : styles0;
      return <Button {...props} ref={ref} style={style} />;
    });
    const styles1 = {
      color: \\"red\\"
    };
    const Test2 = React.forwardRef((props, ref) => {
      const style = props.style != null ? [styles1, props.style] : styles1;
      return <Button {...props} ref={ref} style={style} />;
    });
    const styles2 = {
      color: \\"red\\"
    };
    const Test3 = React.forwardRef((props, ref) => {
      const style = props.style != null ? [styles2, props.style] : styles2;
      return <Button {...props} ref={ref} style={style} />;
    });
    const styles3 = {
      color: \\"red\\"
    };
    const Test4 = React.forwardRef((props, ref) => {
      const style = props.style != null ? [styles3, props.style] : styles3;
      return <Button {...props} ref={ref} style={style} />;
    });
    const styles4 = {
      color: \\"red\\"
    };
    const Test5 = React.forwardRef((props, ref) => {
      const style = props.style != null ? [styles4, props.style] : styles4;
      return <Button {...props} ref={ref} style={style} />;
    });"
  `);
});

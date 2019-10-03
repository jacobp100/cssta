const { styled, build } = require("../__testUtil__");

it("Supports basic styles", () => {
  const css = styled.test`
    color: green;
  `;

  const code = build(css);
  expect(code).toMatchInlineSnapshot(`
    "import React from 'react';
    const styles0 = {
      color: 'green'
    };
    const Example = React.forwardRef((props, ref) => {
      const style = props.style != null ? [styles0, props.style] : styles0;
      return <Element {...props} ref={ref} style={style} />;
    });"
  `);
});

it("Supports basic multiple implicitly-scoped declarations", () => {
  const css = styled.test`
    color: green;
    width: 100px;
  `;

  const code = build(css);
  expect(code).toMatchInlineSnapshot(`
    "import React from 'react';
    const styles0 = {
      color: 'green',
      width: 100
    };
    const Example = React.forwardRef((props, ref) => {
      const style = props.style != null ? [styles0, props.style] : styles0;
      return <Element {...props} ref={ref} style={style} />;
    });"
  `);
});

it("Supports boolean conditional styles", () => {
  const css = styled.test`
    color: green;

    &[@test] {
      color: blue;
    }
  `;

  const code = build(css);
  expect(code).toMatchInlineSnapshot(`
    "import React from 'react';
    const styles0 = {
      color: 'green'
    };
    const styles1 = {
      color: 'blue'
    };
    const Example = React.forwardRef(({
      test,
      ...props
    }, ref) => {
      const baseStyle = test === true ? styles1 : styles0;
      const style = props.style != null ? [baseStyle, props.style] : baseStyle;
      return <Element {...props} ref={ref} style={style} />;
    });"
  `);
});

it("Supports string conditional styles", () => {
  const css = styled.test`
    width: 100px;

    &[@size="small"] {
      width: 80px;
    }

    &[@size="large"] {
      width: 120px;
    }
  `;

  const code = build(css);
  expect(code).toMatchInlineSnapshot(`
    "import React from 'react';
    const styles0 = {
      width: 100
    };
    const styles1 = {
      width: 80
    };
    const styles2 = {
      width: 120
    };
    const Example = React.forwardRef(({
      size,
      ...props
    }, ref) => {
      const baseStyle = size === 'large' ? styles2 : size === 'small' ? styles1 : styles0;
      const style = props.style != null ? [baseStyle, props.style] : baseStyle;
      return <Element {...props} ref={ref} style={style} />;
    });"
  `);
});

it("Optimizes a single conditional style", () => {
  const css = styled.test`
    color: green;

    &[@test] {
      margin: 10px;
    }
  `;

  const code = build(css);
  expect(code).toMatchInlineSnapshot(`
    "import React from 'react';
    const styles0 = {
      color: 'green'
    };
    const styles1 = {
      color: 'green',
      marginTop: 10,
      marginRight: 10,
      marginBottom: 10,
      marginLeft: 10
    };
    const Example = React.forwardRef(({
      test,
      ...props
    }, ref) => {
      const baseStyle = test === true ? styles1 : styles0;
      const style = props.style != null ? [baseStyle, props.style] : baseStyle;
      return <Element {...props} ref={ref} style={style} />;
    });"
  `);
});

import { styled, build } from "../__testUtil__";

it("Supports simple viewport units", () => {
  const css = styled.test`
    width: 50vw;
    height: 50vh;
    max-height: 50vmax;
    min-height: 50vmin;
  `;

  const code = build(css);
  expect(code).toMatchInlineSnapshot(`
    "import React from 'react';
    import useWindowDimensions from 'cssta/runtime/useWindowDimensions';
    const Example = React.forwardRef((props, ref) => {
      const {
        width: windowWidth,
        height: windowHeight
      } = useWindowDimensions();
      const baseStyle = {
        width: Number(windowWidth * 0.5),
        height: Number(windowHeight * 0.5),
        maxHeight: Number(Math.max(windowWidth, windowHeight) * 0.5),
        minHeight: Number(Math.min(windowWidth, windowHeight) * 0.5)
      };
      const style = props.style != null ? [baseStyle, props.style] : baseStyle;
      return <Element {...props} ref={ref} style={style} />;
    });"
  `);
});

it("Supports fixed units with conditional simple viewport units", () => {
  const css = styled.test`
    width: 100px;

    &[@cond] {
      width: 50vw;
    }
  `;

  const code = build(css);
  expect(code).toMatchInlineSnapshot(`
    "import React from 'react';
    import useWindowDimensions from 'cssta/runtime/useWindowDimensions';
    const styles0 = {
      width: 100
    };
    const Example = React.forwardRef(({
      cond,
      ...props
    }, ref) => {
      const {
        width: windowWidth,
        height: windowHeight
      } = useWindowDimensions();
      const baseStyle = cond === true ? {
        width: Number(windowWidth * 0.5)
      } : styles0;
      const style = props.style != null ? [baseStyle, props.style] : baseStyle;
      return <Element {...props} ref={ref} style={style} />;
    });"
  `);
});

it("Supports multiple conditional simple viewport units", () => {
  const css = styled.test`
    width: 10vw;

    &[@cond] {
      width: 50vw;
    }
  `;

  const code = build(css);
  expect(code).toMatchInlineSnapshot(`
    "import React from 'react';
    import useWindowDimensions from 'cssta/runtime/useWindowDimensions';
    const Example = React.forwardRef(({
      cond,
      ...props
    }, ref) => {
      const {
        width: windowWidth,
        height: windowHeight
      } = useWindowDimensions();
      const baseStyle = cond === true ? {
        width: Number(windowWidth * 0.5)
      } : {
        width: Number(windowWidth * 0.1)
      };
      const style = props.style != null ? [baseStyle, props.style] : baseStyle;
      return <Element {...props} ref={ref} style={style} />;
    });"
  `);
});

it("Supports simple viewport units with conditional fixed units", () => {
  const css = styled.test`
    width: 10vw;

    &[@cond] {
      width: 50px;
    }
  `;

  const code = build(css);
  expect(code).toMatchInlineSnapshot(`
    "import React from 'react';
    import useWindowDimensions from 'cssta/runtime/useWindowDimensions';
    const styles0 = {
      width: 50
    };
    const Example = React.forwardRef(({
      cond,
      ...props
    }, ref) => {
      const {
        width: windowWidth,
        height: windowHeight
      } = useWindowDimensions();
      const baseStyle = cond === true ? styles0 : {
        width: Number(windowWidth * 0.1)
      };
      const style = props.style != null ? [baseStyle, props.style] : baseStyle;
      return <Element {...props} ref={ref} style={style} />;
    });"
  `);
});

it("Supports viewport units in shorthands", () => {
  const css = styled.test`
    margin: 10vw;
  `;

  const code = build(css);
  expect(code).toMatchInlineSnapshot(`
    "import React from 'react';
    import useViewportStyle from 'cssta/runtime/useViewportStyle';
    const unresolvedStyleTuples0 = [['margin', '10vw']];
    const Example = React.forwardRef((props, ref) => {
      const styles0 = useViewportStyle(unresolvedStyleTuples0);
      const style = props.style != null ? [styles0, props.style] : styles0;
      return <Element {...props} ref={ref} style={style} />;
    });"
  `);
});

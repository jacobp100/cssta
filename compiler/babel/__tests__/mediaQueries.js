const { styled, build } = require("../__testUtil__");

it("Supports media queries", () => {
  const css = styled.test`
    color: green;

    @media (min-width: 500px) {
      color: red;
    }
  `;

  const code = build(css);
  expect(code).toMatchInlineSnapshot(`
    "import React from 'react';
    import useMediaQuery from 'cssta/runtime/useMediaQuery';
    const styles = {
      0: {
        color: 'green'
      },
      1: {
        color: 'red'
      }
    };
    const Example = React.forwardRef((props, ref) => {
      const {
        width: screenWidth,
        height: screenHeight
      } = useMediaQuery();
      const baseStyle = screenWidth >= 500 ? styles[1] : styles[0];
      const style = props.style != null ? [baseStyle, props.style] : baseStyle;
      return <Element {...props} ref={ref} style={style} />;
    });"
  `);
});

it("Supports media queries with conditions", () => {
  const css = styled.test`
    color: green;

    @media (min-width: 500px) {
      color: red;

      &[@large] {
        width: 500px;
      }
    }
  `;

  const code = build(css);
  expect(code).toMatchInlineSnapshot(`
    "import React from 'react';
    import useMediaQuery from 'cssta/runtime/useMediaQuery';
    const styles = {
      0: {
        color: 'green'
      },
      1: {
        color: 'red'
      },
      2: {
        width: 500
      }
    };
    const Example = React.forwardRef(({
      large,
      ...props
    }, ref) => {
      const {
        width: screenWidth,
        height: screenHeight
      } = useMediaQuery();
      const style = [screenWidth >= 500 ? styles[1] : styles[0], large === true && screenWidth >= 500 ? styles[2] : null, props.style];
      return <Element {...props} ref={ref} style={style} />;
    });"
  `);
});

it("Supports platform media queries", () => {
  const css = styled.test`
    color: green;

    @media (platform: ios) {
      color: red;
    }
  `;

  const code = build(css);
  expect(code).toMatchInlineSnapshot(`
    "import React from 'react';
    import { Platform } from 'react-native';
    const styles = {
      0: {
        color: 'green'
      },
      1: {
        color: 'red'
      }
    };
    const Example = React.forwardRef((props, ref) => {
      const baseStyle = Platform.OS === 'ios' ? styles[1] : styles[0];
      const style = props.style != null ? [baseStyle, props.style] : baseStyle;
      return <Element {...props} ref={ref} style={style} />;
    });"
  `);
});

it("Supports color scheme media queries", () => {
  const css = styled.test`
    color: green;

    @media (prefers-color-scheme: dark) {
      color: red;
    }
  `;

  const code = build(css);
  expect(code).toMatchInlineSnapshot(`
    "import React from 'react';
    import { useColorScheme } from 'react-native';
    const styles = {
      0: {
        color: 'green'
      },
      1: {
        color: 'red'
      }
    };
    const Example = React.forwardRef((props, ref) => {
      const colorScheme = useColorScheme();
      const baseStyle = colorScheme === 'dark' ? styles[1] : styles[0];
      const style = props.style != null ? [baseStyle, props.style] : baseStyle;
      return <Element {...props} ref={ref} style={style} />;
    });"
  `);
});

it("Supports combined media queries", () => {
  const css = styled.test`
    color: green;

    @media (platform: ios) and (min-width: 500) {
      color: red;
    }
  `;

  const code = build(css);
  expect(code).toMatchInlineSnapshot(`
    "import React from 'react';
    import { Platform } from 'react-native';
    import useMediaQuery from 'cssta/runtime/useMediaQuery';
    const styles = {
      0: {
        color: 'green'
      },
      1: {
        color: 'red'
      }
    };
    const Example = React.forwardRef((props, ref) => {
      const {
        width: screenWidth,
        height: screenHeight
      } = useMediaQuery();
      const baseStyle = Platform.OS === 'ios' && screenWidth >= 500 ? styles[1] : styles[0];
      const style = props.style != null ? [baseStyle, props.style] : baseStyle;
      return <Element {...props} ref={ref} style={style} />;
    });"
  `);
});

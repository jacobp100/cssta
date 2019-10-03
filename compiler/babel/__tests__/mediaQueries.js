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
    import useWindowDimensions from 'cssta/runtime/useWindowDimensions';
    const styles0 = {
      color: 'green'
    };
    const styles1 = {
      color: 'red'
    };
    const Example = React.forwardRef((props, ref) => {
      const {
        width: windowWidth,
        height: windowHeight
      } = useWindowDimensions();
      const baseStyle = windowWidth >= 500 ? styles1 : styles0;
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
    import useWindowDimensions from 'cssta/runtime/useWindowDimensions';
    const styles0 = {
      color: 'green'
    };
    const styles1 = {
      color: 'red'
    };
    const styles2 = {
      width: 500
    };
    const Example = React.forwardRef(({
      large,
      ...props
    }, ref) => {
      const {
        width: windowWidth,
        height: windowHeight
      } = useWindowDimensions();
      const style = [windowWidth >= 500 ? styles1 : styles0, large === true && windowWidth >= 500 ? styles2 : null, props.style];
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
    const styles0 = {
      color: 'green'
    };
    const styles1 = {
      color: 'red'
    };
    const Example = React.forwardRef((props, ref) => {
      const baseStyle = Platform.OS === 'ios' ? styles1 : styles0;
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
    const styles0 = {
      color: 'green'
    };
    const styles1 = {
      color: 'red'
    };
    const Example = React.forwardRef((props, ref) => {
      const colorScheme = useColorScheme();
      const baseStyle = colorScheme === 'dark' ? styles1 : styles0;
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
    import useWindowDimensions from 'cssta/runtime/useWindowDimensions';
    const styles0 = {
      color: 'green'
    };
    const styles1 = {
      color: 'red'
    };
    const Example = React.forwardRef((props, ref) => {
      const {
        width: windowWidth,
        height: windowHeight
      } = useWindowDimensions();
      const baseStyle = Platform.OS === 'ios' && windowWidth >= 500 ? styles1 : styles0;
      const style = props.style != null ? [baseStyle, props.style] : baseStyle;
      return <Element {...props} ref={ref} style={style} />;
    });"
  `);
});

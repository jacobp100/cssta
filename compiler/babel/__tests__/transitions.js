const { styled, build } = require("../__testUtil__");

it("Supports transitions", () => {
  const css = styled.test`
    color: red;
    transition: color 5s;

    &[@active] {
      color: green;
    }
  `;

  const code = build(css);
  expect(code).toMatchInlineSnapshot(`
    "import React from 'react';
    import useTransition from 'cssta/runtime/useTransition';
    const styles0 = {
      color: 'red'
    };
    const styles1 = {
      color: 'green'
    };
    const transition = [{
      'property': 'color',
      'timingFunction': 'ease',
      'delay': 0,
      'duration': 5000
    }];
    const Example = React.forwardRef(({
      active,
      ...props
    }, ref) => {
      const baseStyle = active === true ? styles1 : styles0;
      let style = props.style != null ? [baseStyle, props.style] : baseStyle;
      style = useTransition(transition, style);
      return <Element {...props} ref={ref} style={style} />;
    });"
  `);
});

it("Supports conditional transitions", () => {
  const css = styled.test`
    color: red;
    transition: color 5s;

    &[@fast] {
      transition-duration: 1s;
    }

    &[@slow] {
      transition-duration: 10s;
    }
  `;

  const code = build(css);
  expect(code).toMatchInlineSnapshot(`
    "import React from 'react';
    import flattenTransition from 'cssta/runtime/flattenTransition';
    import useTransition from 'cssta/runtime/useTransition';
    const styles0 = {
      color: 'red'
    };
    const Example = React.forwardRef(({
      fast,
      slow,
      ...props
    }, ref) => {
      let style = props.style != null ? [styles0, props.style] : styles0;
      const transition = flattenTransition([{
        '_': 'color 5s'
      }, fast === true ? {
        'duration': '1s'
      } : null, slow === true ? {
        'duration': '10s'
      } : null]);
      style = useTransition(transition, style);
      return <Element {...props} ref={ref} style={style} />;
    });"
  `);
});

const { styled, build } = require("../__testUtil__");

it("Supports exported variables in media queries", () => {
  const css = styled.test`
    --width: 100px;

    @media (min-width: 500px) {
      --width: 200px;
    }
  `;

  const code = build(css);
  expect(code).toMatchInlineSnapshot(`
    "import React from 'react';
    import useMediaQuery from 'cssta/runtime/useMediaQuery';
    import useCustomProperties from 'cssta/runtime/useCustomProperties';
    import VariablesContext from 'cssta/runtime/VariablesContext';
    const Example = React.forwardRef((props, ref) => {
      const {
        width: screenWidth,
        height: screenHeight
      } = useMediaQuery();
      const exportedCustomProperties = {};
      exportedCustomProperties['width'] = '100px';

      if (screenWidth >= 500) {
        exportedCustomProperties['width'] = '200px';
      }

      const customProperties = useCustomProperties(exportedCustomProperties);
      return <VariablesContext.Provider value={customProperties}><Element {...props} ref={ref} /></VariablesContext.Provider>;
    });"
  `);
});

it("Supports transitions vith custom properties", () => {
  const css = styled.test`
    color: red;
    transition: color var(--time);

    &[@active] {
      color: green;
    }
  `;

  const code = build(css);
  expect(code).toMatchInlineSnapshot(`
    "import React from 'react';
    import useCustomProperties from 'cssta/runtime/useCustomProperties';
    import useCustomPropertyShorthandParts from 'cssta/runtime/useCustomPropertyShorthandParts';
    import flattenTransition from 'cssta/runtime/flattenTransition';
    import useTransition from 'cssta/runtime/useTransition';
    const styles = {
      0: {
        color: 'red'
      },
      1: {
        color: 'green'
      }
    };
    const Example = React.forwardRef(({
      active,
      ...props
    }, ref) => {
      const customProperties = useCustomProperties(null);
      const baseStyle = active === true ? styles[1] : styles[0];
      let style = props.style != null ? [baseStyle, props.style] : baseStyle;
      const unresolvedTransitionParts = [{
        '_': 'color var(--time)'
      }];
      const transitionParts = useCustomPropertyShorthandParts(unresolvedTransitionParts, customProperties);
      const transition = flattenTransition(transitionParts);
      style = useTransition(transition, style);
      return <Element {...props} ref={ref} style={style} />;
    });"
  `);
});

it("Supports conditional transitions with custom properties", () => {
  const css = styled.test`
    color: red;
    transition: color var(--time);

    &[@fast] {
      transition-duration: var(--time-fast);
    }

    &[@slow] {
      transition-duration: var(--time-slow);
    }
  `;

  const code = build(css);
  expect(code).toMatchInlineSnapshot(`
    "import React from 'react';
    import useCustomProperties from 'cssta/runtime/useCustomProperties';
    import useCustomPropertyShorthandParts from 'cssta/runtime/useCustomPropertyShorthandParts';
    import flattenTransition from 'cssta/runtime/flattenTransition';
    import useTransition from 'cssta/runtime/useTransition';
    const styles = {
      0: {
        color: 'red'
      }
    };
    const Example = React.forwardRef(({
      fast,
      slow,
      ...props
    }, ref) => {
      const customProperties = useCustomProperties(null);
      let style = props.style != null ? [styles[0], props.style] : styles[0];
      const unresolvedTransitionParts = [{
        '_': 'color var(--time)'
      }, fast === true ? {
        'duration': 'var(--time-fast)'
      } : null, slow === true ? {
        'duration': 'var(--time-slow)'
      } : null];
      const transitionParts = useCustomPropertyShorthandParts(unresolvedTransitionParts, customProperties);
      const transition = flattenTransition(transitionParts);
      style = useTransition(transition, style);
      return <Element {...props} ref={ref} style={style} />;
    });"
  `);
});
it("Supports animations with custom properties", () => {
  const css = styled.test`
    animation: fade-in var(--time);

    @keyframes fade-in {
      0% {
        opacity: 0;
      }
      100% {
        opacity: 1;
      }
    }
  `;

  const code = build(css);
  expect(code).toMatchInlineSnapshot(`
    "import React from 'react';
    import useCustomProperties from 'cssta/runtime/useCustomProperties';
    import useCustomPropertyShorthandParts from 'cssta/runtime/useCustomPropertyShorthandParts';
    import flattenAnimation from 'cssta/runtime/flattenAnimation';
    import useAnimation from 'cssta/runtime/useAnimation';
    const keyframes = {
      'fade-in': [{
        'time': 0,
        'style': {
          opacity: 0
        }
      }, {
        'time': 1,
        'style': {
          opacity: 1
        }
      }]
    };
    const Example = React.forwardRef((props, ref) => {
      const customProperties = useCustomProperties(null);
      let style = props.style;
      const unresolvedAnimationParts = [{
        '_': 'fade-in var(--time)'
      }];
      const animationParts = useCustomPropertyShorthandParts(unresolvedAnimationParts, customProperties);
      const animation = flattenAnimation(animationParts);
      style = useAnimation(keyframes, animation, style);
      return <Element {...props} ref={ref} style={style} />;
    });"
  `);
});

it("Supports conditional animations with custom properties", () => {
  const css = styled.test`
    animation: fade-in var(--time);

    &[@slow] {
      animation: fade-in var(--time-slow);
    }

    @keyframes fade-in {
      0% {
        opacity: 0;
      }
      100% {
        opacity: 1;
      }
    }
  `;

  const code = build(css);
  expect(code).toMatchInlineSnapshot(`
    "import React from 'react';
    import useCustomProperties from 'cssta/runtime/useCustomProperties';
    import useCustomPropertyShorthandParts from 'cssta/runtime/useCustomPropertyShorthandParts';
    import flattenAnimation from 'cssta/runtime/flattenAnimation';
    import useAnimation from 'cssta/runtime/useAnimation';
    const keyframes = {
      'fade-in': [{
        'time': 0,
        'style': {
          opacity: 0
        }
      }, {
        'time': 1,
        'style': {
          opacity: 1
        }
      }]
    };
    const Example = React.forwardRef(({
      slow,
      ...props
    }, ref) => {
      const customProperties = useCustomProperties(null);
      let style = props.style;
      const unresolvedAnimationParts = [{
        '_': 'fade-in var(--time)'
      }, slow === true ? {
        '_': 'fade-in var(--time-slow)'
      } : null];
      const animationParts = useCustomPropertyShorthandParts(unresolvedAnimationParts, customProperties);
      const animation = flattenAnimation(animationParts);
      style = useAnimation(keyframes, animation, style);
      return <Element {...props} ref={ref} style={style} />;
    });"
  `);
});

it("Supports transitions with animations", () => {
  const css = styled.test`
    animation: fade-in 1s;
    transition: color 1s;
    color: black;

    &[@inverted] {
      color: white;
    }

    @keyframes fade-in {
      0% {
        opacity: 0;
      }
      100% {
        opacity: 1;
      }
    }
  `;

  const code = build(css);
  expect(code).toMatchInlineSnapshot(`
    "import React from 'react';
    import useTransition from 'cssta/runtime/useTransition';
    import useAnimation from 'cssta/runtime/useAnimation';
    const styles = {
      0: {
        color: 'black'
      },
      1: {
        color: 'white'
      }
    };
    const transition = [{
      'property': 'color',
      'timingFunction': 'ease',
      'delay': 0,
      'duration': 1000
    }];
    const keyframes = {
      'fade-in': [{
        'time': 0,
        'style': {
          opacity: 0
        }
      }, {
        'time': 1,
        'style': {
          opacity: 1
        }
      }]
    };
    const animation = {
      'delay': 0,
      'duration': 1000,
      'iterations': 1,
      'name': 'fade-in',
      'timingFunction': 'ease'
    };
    const Example = React.forwardRef(({
      inverted,
      ...props
    }, ref) => {
      const baseStyle = inverted === true ? styles[1] : styles[0];
      let style = props.style != null ? [baseStyle, props.style] : baseStyle;
      style = useTransition(transition, style);
      style = useAnimation(keyframes, animation, style);
      return <Element {...props} ref={ref} style={style} />;
    });"
  `);
});

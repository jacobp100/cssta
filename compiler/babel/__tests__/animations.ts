import { styled, build } from "../__testUtil__";

it("Supports keyframes", () => {
  const css = styled.test`
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
      return <Element {...props} ref={ref} />;
    });"
  `);
});

it("Supports animations", () => {
  const css = styled.test`
    animation: fade-in 1s;

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
    const animation = {
      'delay': 0,
      'duration': 1000,
      'iterations': 1,
      'name': 'fade-in',
      'timingFunction': 'ease'
    };
    const Example = React.forwardRef((props, ref) => {
      let style = props.style;
      style = useAnimation(keyframes, animation, style);
      return <Element {...props} ref={ref} style={style} />;
    });"
  `);
});

it("Supports conditional animations", () => {
  const css = styled.test`
    animation: fade-in 1s;

    &[@slow] {
      animation: fade-in 5s;
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
      let style = props.style;
      const animation = flattenAnimation([{
        '_': 'fade-in 1s'
      }, slow === true ? {
        '_': 'fade-in 5s'
      } : null]);
      style = useAnimation(keyframes, animation, style);
      return <Element {...props} ref={ref} style={style} />;
    });"
  `);
});

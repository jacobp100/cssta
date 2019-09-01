const babel = require("@babel/core");
const { default: generate } = require("@babel/generator");
const processNative = require("../babel/build");

const { types: t } = babel;
const styled = { test: String.raw };

const build = css => {
  const ast = babel.parse("const Example = 'replaceMe'");
  babel.traverse(ast, {
    StringLiteral(path) {
      if (path.node.value === "replaceMe") {
        processNative(
          babel,
          path,
          t.identifier("Element"),
          t.templateLiteral([t.templateElement({ raw: css, cooked: css })], []),
          { jsx: true }
        );
      }
    }
  });
  const { code } = generate(ast);
  return code.replace(/"/g, "'");
};

it("Supports basic styles", () => {
  const css = styled.test`
    color: green;
  `;

  const code = build(css);
  expect(code).toMatchInlineSnapshot(`
    "import React from 'react';
    const styles = {
      0: {
        color: 'green'
      }
    };
    const Example = React.forwardRef((props, ref) => {
      const style = props.style != null ? [styles[0], props.style] : styles[0];
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
    const styles = {
      0: {
        color: 'green',
        width: 100
      }
    };
    const Example = React.forwardRef((props, ref) => {
      const style = props.style != null ? [styles[0], props.style] : styles[0];
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
    const styles = {
      0: {
        color: 'green'
      },
      1: {
        color: 'blue'
      }
    };
    const Example = React.forwardRef(({
      test,
      ...props
    }, ref) => {
      const style = [styles[0], test === true ? styles[1] : null, props.style];
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
    const styles = {
      0: {
        width: 100
      },
      1: {
        width: 80
      },
      2: {
        width: 120
      }
    };
    const Example = React.forwardRef(({
      size,
      ...props
    }, ref) => {
      const style = [styles[0], size === 'small' ? styles[1] : null, size === 'large' ? styles[2] : null, props.style];
      return <Element {...props} ref={ref} style={style} />;
    });"
  `);
});

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
      const style = [styles[0], screenWidth >= 500 ? styles[1] : null, props.style];
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
      const style = [styles[0], screenWidth >= 500 ? styles[1] : null, large === true && screenWidth >= 500 ? styles[2] : null, props.style];
      return <Element {...props} ref={ref} style={style} />;
    });"
  `);
});

it("Supports imported variables", () => {
  const css = styled.test`
    width: var(--width);
  `;

  const code = build(css);
  expect(code).toMatchInlineSnapshot(`
    "import React from 'react';
    import useCustomProperties from 'cssta/runtime/useCustomProperties';
    import useCustomPropertyStyleSheet from 'cssta/runtime/useCustomPropertyStyleSheet';
    const unresolvedStyleTuples = [[['width', 'var(--width)']]];
    const Example = React.forwardRef((props, ref) => {
      const customProperties = useCustomProperties(null);
      const styles = useCustomPropertyStyleSheet(unresolvedStyleTuples, customProperties);
      const style = props.style != null ? [styles[0], props.style] : styles[0];
      return <Element {...props} ref={ref} style={style} />;
    });"
  `);
});

it("Supports exported variables", () => {
  const css = styled.test`
    --width: 100px;
  `;

  const code = build(css);
  expect(code).toMatchInlineSnapshot(`
    "import React from 'react';
    import useCustomProperties from 'cssta/runtime/useCustomProperties';
    import VariablesContext from 'cssta/runtime/VariablesContext';
    const exportedCustomProperties = {
      'width': '100px'
    };
    const Example = React.forwardRef((props, ref) => {
      const customProperties = useCustomProperties(exportedCustomProperties);
      return <VariablesContext.Provider value={customProperties}><Element {...props} ref={ref} /></VariablesContext.Provider>;
    });"
  `);
});

it("Supports imported and exported variables", () => {
  const css = styled.test`
    --width: var(--height);
  `;

  const code = build(css);
  expect(code).toMatchInlineSnapshot(`
    "import React from 'react';
    import useCustomProperties from 'cssta/runtime/useCustomProperties';
    import VariablesContext from 'cssta/runtime/VariablesContext';
    const exportedCustomProperties = {
      'width': 'var(--height)'
    };
    const Example = React.forwardRef((props, ref) => {
      const customProperties = useCustomProperties(exportedCustomProperties);
      return <VariablesContext.Provider value={customProperties}><Element {...props} ref={ref} /></VariablesContext.Provider>;
    });"
  `);
});

it("Supports conditional exported variables", () => {
  const css = styled.test`
    --width: 100px;

    &[@condition] {
      --width: 200px;
    }
  `;

  const code = build(css);
  expect(code).toMatchInlineSnapshot(`
    "import React from 'react';
    import useCustomProperties from 'cssta/runtime/useCustomProperties';
    import VariablesContext from 'cssta/runtime/VariablesContext';
    const Example = React.forwardRef(({
      condition,
      ...props
    }, ref) => {
      const exportedCustomProperties = {};
      exportedCustomProperties['width'] = '100px';

      if (condition === true) {
        exportedCustomProperties['width'] = '200px';
      }

      const customProperties = useCustomProperties(exportedCustomProperties);
      return <VariablesContext.Provider value={customProperties}><Element {...props} ref={ref} /></VariablesContext.Provider>;
    });"
  `);
});

it("Supports multiple conditional exported variables", () => {
  const css = styled.test`
    --width: 100px;
    --height: 100px;

    &[@condition] {
      --width: 200px;
      --height: 200px;
    }
  `;

  const code = build(css);
  expect(code).toMatchInlineSnapshot(`
    "import React from 'react';
    import useCustomProperties from 'cssta/runtime/useCustomProperties';
    import VariablesContext from 'cssta/runtime/VariablesContext';
    const Example = React.forwardRef(({
      condition,
      ...props
    }, ref) => {
      const exportedCustomProperties = {};
      exportedCustomProperties['width'] = '100px';
      exportedCustomProperties['height'] = '100px';

      if (condition === true) {
        exportedCustomProperties['width'] = '200px';
        exportedCustomProperties['height'] = '200px';
      }

      const customProperties = useCustomProperties(exportedCustomProperties);
      return <VariablesContext.Provider value={customProperties}><Element {...props} ref={ref} /></VariablesContext.Provider>;
    });"
  `);
});

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
    const styles = {
      0: {
        color: 'red'
      },
      1: {
        color: 'green'
      }
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
      let style = [styles[0], active === true ? styles[1] : null, props.style];
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
      let style = props.style != null ? [styles[0], props.style] : styles[0];
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
      let style = [styles[0], active === true ? styles[1] : null, props.style];
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
      let style = props.style;
      style = useAnimation(keyframes, null, style);
      return <Element {...props} ref={ref} style={style} />;
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
      let style = [styles[0], inverted === true ? styles[1] : null, props.style];
      style = useTransition(transition, style);
      style = useAnimation(keyframes, animation, style);
      return <Element {...props} ref={ref} style={style} />;
    });"
  `);
});

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
      processNative(babel, path, element, body, { jsx: true });
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
      "`;"
  );
  babel.traverse(ast, {
    TaggedTemplateExpression(path) {
      const { tag, quasi: body } = path.node;
      const element = tag.arguments[0];
      processNative(babel, path, element, body, { jsx: true });
    }
  });
  const { code } = generate(ast);
  expect(code).toMatchInlineSnapshot(`
    "import React from \\"react\\";
    import { transformStyleTuples } from \\"cssta/runtime/cssUtil\\";
    const styles = {
      0: Object.assign({
        color: String(red).trim()
      }, transformStyleTuples([[\\"margin\\", \`\${small}\`]]))
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
      processNative(babel, path, element, body, { jsx: true });
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

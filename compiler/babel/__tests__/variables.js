const { styled, build } = require("../__testUtil__");

it("Supports imported variables", () => {
  const css = styled.test`
    width: var(--width);
  `;

  const code = build(css);
  expect(code).toMatchInlineSnapshot(`
    "import React from 'react';
    import useCustomProperties from 'cssta/runtime/useCustomProperties';
    import useCustomPropertyStyles from 'cssta/runtime/useCustomPropertyStyles';
    const unresolvedStyleTuples0 = [['width', 'var(--width)']];
    const Example = React.forwardRef((props, ref) => {
      const customProperties = useCustomProperties(null);
      const styles = useCustomPropertyStyles(unresolvedStyleTuples0, customProperties);
      const style = props.style != null ? [styles, props.style] : styles;
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

it("Supports rules where only some import variables", () => {
  const css = styled.test`
    width: 100px;

    &[@cond1] {
      width: var(--something);
    }

    &[@cond2] {
      width: 200px;
    }

    &[@cond1] {
      width: var(--somethingElse);
    }
  `;

  const code = build(css);
  expect(code).toMatchInlineSnapshot(`
    "import React from 'react';
    import useCustomProperties from 'cssta/runtime/useCustomProperties';
    import useCustomPropertyStyles from 'cssta/runtime/useCustomPropertyStyles';
    const styles0 = {
      width: 100
    };
    const unresolvedStyleTuples0 = [['width', 'var(--something)']];
    const styles1 = {
      width: 200
    };
    const unresolvedStyleTuples1 = [['width', 'var(--somethingElse)']];
    const Example = React.forwardRef(({
      cond1,
      cond2,
      ...props
    }, ref) => {
      const customProperties = useCustomProperties(null);
      const styles = useCustomPropertyStyles(unresolvedStyleTuples0, customProperties);
      const styles2 = useCustomPropertyStyles(unresolvedStyleTuples1, customProperties);
      const baseStyle = cond1 === true ? styles2 : cond2 === true ? styles1 : cond1 === true ? styles : styles0;
      const style = props.style != null ? [baseStyle, props.style] : baseStyle;
      return <Element {...props} ref={ref} style={style} />;
    });"
  `);
});

it("Supports global variables in config", () => {
  const css = styled.test`
    color: var(--primary);
  `;

  const code = build(css, {
    globals: {
      primary: "red"
    }
  });
  expect(code).toMatchInlineSnapshot(`
    "import React from 'react';
    const styles0 = {
      color: 'red'
    };
    const Example = React.forwardRef((props, ref) => {
      const style = props.style != null ? [styles0, props.style] : styles0;
      return <Element {...props} ref={ref} style={style} />;
    });"
  `);
});

it("Omits missing globals", () => {
  const css = styled.test`
    color: var(--primary);
    background: var(--secondary);
  `;

  const code = build(css, {
    globals: {
      primary: "red"
    }
  });
  expect(code).toMatchInlineSnapshot(`
    "import React from 'react';
    import useCustomProperties from 'cssta/runtime/useCustomProperties';
    import useCustomPropertyStyles from 'cssta/runtime/useCustomPropertyStyles';
    const unresolvedStyleTuples0 = [['color', 'red'], ['background', 'var(--secondary)']];
    const Example = React.forwardRef((props, ref) => {
      const customProperties = useCustomProperties(null);
      const styles = useCustomPropertyStyles(unresolvedStyleTuples0, customProperties);
      const style = props.style != null ? [styles, props.style] : styles;
      return <Element {...props} ref={ref} style={style} />;
    });"
  `);
});

it("Does not allow overwriting global variables", () => {
  const css = styled.test`
    --primary: blue;
  `;

  expect(() => {
    build(css, {
      globals: {
        primary: "red"
      }
    });
  }).toThrow(
    'Attempted to overwrite global variable "primary". Either change this variable, or remove it from the globals. See line `--primary: blue`'
  );
});

it("Supports failing build on missing global", () => {
  const css = styled.test`
    color: var(--primary);
    background: var(--secondary);
  `;

  expect(() => {
    build(css, {
      globals: {
        primary: "red"
      },
      globalVarsOnly: true
    });
  }).toThrow(
    'Found variable "secondary". This was not defined in the globals, and `globalVarsOnly` is enabled. See line with `var(--secondary)`'
  );
});

it("Does not fail failing build on missing global with globalVarsOnly if there is a fallback", () => {
  const css = styled.test`
    color: var(--primary);
    background: var(--secondary, orange);
  `;

  const code = build(css, {
    globals: {
      primary: "red"
    },
    globalVarsOnly: true
  });
  expect(code).toMatchInlineSnapshot(`
    "import React from 'react';
    const styles0 = {
      color: 'red',
      backgroundColor: 'orange'
    };
    const Example = React.forwardRef((props, ref) => {
      const style = props.style != null ? [styles0, props.style] : styles0;
      return <Element {...props} ref={ref} style={style} />;
    });"
  `);
});

import * as babel from "@babel/core";

it("Works with babel-plugin-cssta", () => {
  const { code } = babel.transform(
    "import styled from 'cssta/native';" +
      "const Test1 = styled(Button)`" +
      "  color: red;" +
      "`;" +
      "const Test2 = styled(Button)`" +
      "  color: red;" +
      "`;" +
      "const testMixin = styled.mixin`" +
      "  color: red;" +
      "`",
    {
      filename: __filename,
      plugins: [require.resolve("../babel-plugin")],
      babelrc: false
    }
  );
  expect(code).toMatchInlineSnapshot(`
    "import React from \\"react\\";
    const styles0 = {
      color: \\"red\\"
    };
    const Test1 = React.forwardRef((props, ref) => {
      const style = props.style != null ? [styles0, props.style] : styles0;
      return React.createElement(Button, { ...props,
        ref: ref,
        style: style
      });
    });
    const styles1 = {
      color: \\"red\\"
    };
    const Test2 = React.forwardRef((props, ref) => {
      const style = props.style != null ? [styles1, props.style] : styles1;
      return React.createElement(Button, { ...props,
        ref: ref,
        style: style
      });
    });
    const styles2 = {
      color: \\"red\\"
    };

    const testMixin = () => {
      const style = styles2;
      return style;
    };"
  `);
});

it("Works with babel-plugin-macros", () => {
  const { code } = babel.transform(
    "import styled from '../native.macro';" +
      "const Test1 = styled(Button)`" +
      "  color: red;" +
      "`;" +
      "const Test2 = styled(Button)`" +
      "  color: red;" +
      "`;" +
      "const testMixin = styled.mixin`" +
      "  color: red;" +
      "`",
    {
      filename: __filename,
      plugins: ["babel-plugin-macros"],
      babelrc: false
    }
  );
  expect(code).toMatchInlineSnapshot(`
    "import React from \\"react\\";
    const styles0 = {
      color: \\"red\\"
    };
    const Test1 = React.forwardRef((props, ref) => {
      const style = props.style != null ? [styles0, props.style] : styles0;
      return React.createElement(Button, { ...props,
        ref: ref,
        style: style
      });
    });
    const styles1 = {
      color: \\"red\\"
    };
    const Test2 = React.forwardRef((props, ref) => {
      const style = props.style != null ? [styles1, props.style] : styles1;
      return React.createElement(Button, { ...props,
        ref: ref,
        style: style
      });
    });
    const styles2 = {
      color: \\"red\\"
    };

    const testMixin = () => {
      const style = styles2;
      return style;
    };"
  `);
});

it("Works with plugin-transform-modules-commonjs", () => {
  let { code } = babel.transform(
    "import styled from 'cssta/native';" +
      "const Test1 = styled(Button)`" +
      "  color: var(--color);" +
      "  --color: red;" +
      "`;" +
      "const Test2 = styled(Button)`" +
      "  color: red;" +
      "`;",
    {
      filename: __filename,
      plugins: [
        require.resolve("../babel-plugin"),
        "@babel/plugin-transform-modules-commonjs"
      ],
      babelrc: false
    }
  );
  code = babel.transform(code).code; // Reformat
  expect(code).toMatchInlineSnapshot(`
    "\\"use strict\\";

    var _react = _interopRequireDefault(require(\\"react\\"));

    var _useCustomProperties = _interopRequireDefault(require(\\"cssta/runtime/useCustomProperties\\"));

    var _useCustomPropertyStyles = _interopRequireDefault(require(\\"cssta/runtime/useCustomPropertyStyles\\"));

    var _VariablesContext = _interopRequireDefault(require(\\"cssta/runtime/VariablesContext\\"));

    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }

    const exportedCustomProperties = {
      \\"color\\": \\"red\\"
    };
    const unresolvedStyleTuples0 = [[\\"color\\", \\"var(--color)\\"]];

    const Test1 = _react.default.forwardRef((props, ref) => {
      const customProperties = (0, _useCustomProperties.default)(exportedCustomProperties);
      const styles = (0, _useCustomPropertyStyles.default)(unresolvedStyleTuples0, customProperties);
      const style = props.style != null ? [styles, props.style] : styles;
      return _react.default.createElement(_VariablesContext.default.Provider, {
        value: customProperties
      }, _react.default.createElement(Button, { ...props,
        ref: ref,
        style: style
      }));
    });

    const styles0 = {
      color: \\"red\\"
    };

    const Test2 = _react.default.forwardRef((props, ref) => {
      const style = props.style != null ? [styles0, props.style] : styles0;
      return _react.default.createElement(Button, { ...props,
        ref: ref,
        style: style
      });
    });"
  `);
});

it("Works with options", () => {
  const { code } = babel.transform(
    "import styled from 'cssta/native';" +
      "const Test1 = styled(Button)`" +
      "  color: var(--color);" +
      "`;",
    {
      filename: __filename,
      plugins: [
        [require.resolve("../babel-plugin"), { globals: { color: "red" } }]
      ],
      babelrc: false
    }
  );
  expect(code).toMatchInlineSnapshot(`
    "import React from \\"react\\";
    const styles0 = {
      color: \\"red\\"
    };
    const Test1 = React.forwardRef((props, ref) => {
      const style = props.style != null ? [styles0, props.style] : styles0;
      return React.createElement(Button, { ...props,
        ref: ref,
        style: style
      });
    });"
  `);
});

"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
exports.__esModule = true;
var babel = __importStar(require("@babel/core"));
it("Works with babel-plugin-cssta", function () {
    var code = babel.transform("import styled from 'cssta/native';" +
        "const Test1 = styled(Button)`" +
        "  color: red;" +
        "`;" +
        "const Test2 = styled(Button)`" +
        "  color: red;" +
        "`;" +
        "const testMixin = styled.mixin`" +
        "  color: red;" +
        "`", {
        filename: __filename,
        plugins: [require.resolve("../babel-plugin")],
        babelrc: false
    }).code;
    expect(code).toMatchInlineSnapshot("\n    \"import React from \\\"react\\\";\n    const styles0 = {\n      color: \\\"red\\\"\n    };\n    const Test1 = React.forwardRef((props, ref) => {\n      const style = props.style != null ? [styles0, props.style] : styles0;\n      return React.createElement(Button, { ...props,\n        ref: ref,\n        style: style\n      });\n    });\n    const styles1 = {\n      color: \\\"red\\\"\n    };\n    const Test2 = React.forwardRef((props, ref) => {\n      const style = props.style != null ? [styles1, props.style] : styles1;\n      return React.createElement(Button, { ...props,\n        ref: ref,\n        style: style\n      });\n    });\n    const styles2 = {\n      color: \\\"red\\\"\n    };\n\n    const testMixin = () => {\n      const style = styles2;\n      return style;\n    };\"\n  ");
});
it("Works with babel-plugin-macros", function () {
    var code = babel.transform("import styled from '../native.macro';" +
        "const Test1 = styled(Button)`" +
        "  color: red;" +
        "`;" +
        "const Test2 = styled(Button)`" +
        "  color: red;" +
        "`;" +
        "const testMixin = styled.mixin`" +
        "  color: red;" +
        "`", {
        filename: __filename,
        plugins: ["babel-plugin-macros"],
        babelrc: false
    }).code;
    expect(code).toMatchInlineSnapshot("\n    \"import React from \\\"react\\\";\n    const styles0 = {\n      color: \\\"red\\\"\n    };\n    const Test1 = React.forwardRef((props, ref) => {\n      const style = props.style != null ? [styles0, props.style] : styles0;\n      return React.createElement(Button, { ...props,\n        ref: ref,\n        style: style\n      });\n    });\n    const styles1 = {\n      color: \\\"red\\\"\n    };\n    const Test2 = React.forwardRef((props, ref) => {\n      const style = props.style != null ? [styles1, props.style] : styles1;\n      return React.createElement(Button, { ...props,\n        ref: ref,\n        style: style\n      });\n    });\n    const styles2 = {\n      color: \\\"red\\\"\n    };\n\n    const testMixin = () => {\n      const style = styles2;\n      return style;\n    };\"\n  ");
});
it("Works with plugin-transform-modules-commonjs", function () {
    var code = babel.transform("import styled from 'cssta/native';" +
        "const Test1 = styled(Button)`" +
        "  color: var(--color);" +
        "  --color: red;" +
        "`;" +
        "const Test2 = styled(Button)`" +
        "  color: red;" +
        "`;", {
        filename: __filename,
        plugins: [
            require.resolve("../babel-plugin"),
            "@babel/plugin-transform-modules-commonjs"
        ],
        babelrc: false
    }).code;
    code = babel.transform(code).code; // Reformat
    expect(code).toMatchInlineSnapshot("\n    \"\\\"use strict\\\";\n\n    var _react = _interopRequireDefault(require(\\\"react\\\"));\n\n    var _useCustomProperties = _interopRequireDefault(require(\\\"cssta/runtime/useCustomProperties\\\"));\n\n    var _useCustomPropertyStyles = _interopRequireDefault(require(\\\"cssta/runtime/useCustomPropertyStyles\\\"));\n\n    var _VariablesContext = _interopRequireDefault(require(\\\"cssta/runtime/VariablesContext\\\"));\n\n    function _interopRequireDefault(obj) {\n      return obj && obj.__esModule ? obj : {\n        default: obj\n      };\n    }\n\n    const exportedCustomProperties = {\n      \\\"color\\\": \\\"red\\\"\n    };\n    const unresolvedStyleTuples0 = [[\\\"color\\\", \\\"var(--color)\\\"]];\n\n    const Test1 = _react.default.forwardRef((props, ref) => {\n      const customProperties = (0, _useCustomProperties.default)(exportedCustomProperties);\n      const styles = (0, _useCustomPropertyStyles.default)(unresolvedStyleTuples0, customProperties);\n      const style = props.style != null ? [styles, props.style] : styles;\n      return _react.default.createElement(_VariablesContext.default.Provider, {\n        value: customProperties\n      }, _react.default.createElement(Button, { ...props,\n        ref: ref,\n        style: style\n      }));\n    });\n\n    const styles0 = {\n      color: \\\"red\\\"\n    };\n\n    const Test2 = _react.default.forwardRef((props, ref) => {\n      const style = props.style != null ? [styles0, props.style] : styles0;\n      return _react.default.createElement(Button, { ...props,\n        ref: ref,\n        style: style\n      });\n    });\"\n  ");
});
it("Works with options", function () {
    var code = babel.transform("import styled from 'cssta/native';" +
        "const Test1 = styled(Button)`" +
        "  color: var(--color);" +
        "`;", {
        filename: __filename,
        plugins: [
            [require.resolve("../babel-plugin"), { globals: { color: "red" } }]
        ],
        babelrc: false
    }).code;
    expect(code).toMatchInlineSnapshot("\n    \"import React from \\\"react\\\";\n    const styles0 = {\n      color: \\\"red\\\"\n    };\n    const Test1 = React.forwardRef((props, ref) => {\n      const style = props.style != null ? [styles0, props.style] : styles0;\n      return React.createElement(Button, { ...props,\n        ref: ref,\n        style: style\n      });\n    });\"\n  ");
});

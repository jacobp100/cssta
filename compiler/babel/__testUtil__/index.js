const babel = require("@babel/core");
const { default: generate } = require("@babel/generator");
const buildElement = require("../buildElement");

const { types: t } = babel;
module.exports.styled = { test: String.raw };

module.exports.build = (css, options = {}) => {
  const ast = babel.parse("const Example = 'replaceMe'");
  babel.traverse(ast, {
    StringLiteral(path) {
      if (path.node.value === "replaceMe") {
        buildElement(
          babel,
          path,
          options,
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

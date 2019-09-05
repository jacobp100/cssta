const { createMacro } = require("babel-plugin-macros");
const processNative = require("./compiler/babel/build");

module.exports = createMacro(arg => {
  const { babel, references } = arg;
  const { types: t } = babel;

  references.default
    .map(path => path.findParent(t.isTaggedTemplateExpression))
    .forEach(path => {
      const element = path.get("tag.arguments.0").node;
      const css = path.get("quasi").node;
      processNative(babel, path, element, css);
    });
});

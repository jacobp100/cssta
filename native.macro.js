const { createMacro } = require("babel-plugin-macros");
const buildElement = require("./compiler/babel/buildElement");
const buildMixin = require("./compiler/babel/buildMixin");

module.exports = createMacro(({ babel, references, config }) => {
  const { types: t } = babel;

  references.default
    .map(path => path.findParent(t.isTaggedTemplateExpression))
    .forEach(path => {
      const tag = path.node.tag;
      const css = path.get("quasi").node;

      if (
        t.isMemberExpression(tag) &&
        t.isIdentifier(tag.property, { name: "mixin" })
      ) {
        buildMixin(babel, path, config, css);
      } else if (t.isCallExpression(tag)) {
        const element = path.get("tag.arguments.0").node;
        buildElement(babel, path, config, element, css);
      }
    });
});

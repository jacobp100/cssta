import { createMacro } from "babel-plugin-macros";
import buildElement from "./compiler/babel/buildElement";
import buildMixin from "./compiler/babel/buildMixin";

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
        buildMixin(babel, path, css, config);
      } else if (t.isCallExpression(tag)) {
        const element = path.get("tag.arguments.0").node;
        buildElement(babel, path, element, css, config);
      }
    });
});

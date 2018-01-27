const { createMacro } = require("babel-plugin-macros");
const csstaCall = require("../babel-plugin/visitors/csstaCall");
const { addImport } = require("./util");

module.exports = createMacro(arg => {
  const { babel, state } = arg;
  addImport(arg, "prodcssta");

  /* eslint-disable no-param-reassign */
  arg.references.default.forEach(path => {
    path.node.name = "prodcssta";
    const templatePath = path.findParent(
      babel.types.isTaggedTemplateExpression
    );
    csstaCall.TaggedTemplateExpression(babel, templatePath, state);
  });
});

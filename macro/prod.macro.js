const { createMacro } = require("babel-plugin-macros");
const csstaCall = require("../babel-plugin/visitors/csstaCall");

module.exports = createMacro(({ babel, state, references }) => {
  references.default
    .map(path => path.findParent(babel.types.isTaggedTemplateExpression))
    .forEach(path => {
      csstaCall.TaggedTemplateExpression(babel, path, state);
    });
});

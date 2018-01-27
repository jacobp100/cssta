const { createMacro } = require("babel-plugin-macros");
const { addImport } = require("./util");

module.exports = createMacro(arg => {
  addImport(arg, { default: "__devcssta_web__" }, "cssta");

  /* eslint-disable no-param-reassign */
  arg.references.default.forEach(path => {
    path.node.name = "__devcssta_web__";
  });
});

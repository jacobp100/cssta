const { createMacro } = require("babel-plugin-macros");
const { addImport } = require("./util");

module.exports = createMacro(arg => {
  addImport(arg, "devcssta");

  /* eslint-disable no-param-reassign */
  arg.references.default.forEach(path => {
    path.node.name = "devcssta";
  });
});

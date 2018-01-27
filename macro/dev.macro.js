const { createMacro } = require("babel-plugin-macros");
const { addImport } = require("./util");

module.exports = createMacro(arg => {
  addImport(arg, "__devcssta_web__");

  /* eslint-disable no-param-reassign */
  arg.references.default.forEach(path => {
    path.node.name = "__devcssta_web__";
  });
});

const { createMacro } = require("babel-plugin-macros");

module.exports = createMacro(arg => {
  const path = arg.references.default[0];
  path.node.name = "devcssta";

  const t = arg.babel.types;
  const identifier = t.identifier("devcssta");
  const importDefaultSpecifier = t.importDefaultSpecifier(identifier);
  const importDeclaration = t.importDeclaration(
    [importDefaultSpecifier],
    t.stringLiteral("cssta")
  );
  const program = path.findParent(p => p.isProgram());
  program.unshiftContainer("body", importDeclaration);
});

module.exports.addImport = (arg, importName) => {
  const t = arg.babel.types;
  const identifier = t.identifier(importName);
  const importDefaultSpecifier = t.importDefaultSpecifier(identifier);
  const importDeclaration = t.importDeclaration(
    [importDefaultSpecifier],
    t.stringLiteral("cssta")
  );
  const program = arg.references.default[0].findParent(p => p.isProgram());
  const [importPath] = program.unshiftContainer("body", importDeclaration);
  program.scope.registerDeclaration(importPath.get("specifiers.0"));
};

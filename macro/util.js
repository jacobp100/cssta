module.exports.addImport = (
  arg,
  { default: defaultName },
  filename,
  { atEndOfProgram = false } = {}
) => {
  const t = arg.babel.types;

  const specifiers = [];
  if (defaultName) {
    const identifier = t.identifier(defaultName);
    const importDefaultSpecifier = t.importDefaultSpecifier(identifier);
    specifiers.push(importDefaultSpecifier);
  }

  const importDeclaration = t.importDeclaration(
    specifiers,
    t.stringLiteral(filename)
  );
  const program = arg.references.default[0].findParent(p => p.isProgram());

  let importPath;
  if (atEndOfProgram) {
    program.pushContainer("body", importDeclaration);
  } else {
    [importPath] = program.unshiftContainer("body", importDeclaration);
  }

  specifiers.forEach((unused, index) => {
    program.scope.registerDeclaration(importPath.get(`specifiers.${index}`));
  });
};

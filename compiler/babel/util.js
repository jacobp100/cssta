const generateNiceId = (babel, path, name, { prefix0 = false } = {}) => {
  const { types: t } = babel;

  let testId = prefix0 ? `${name}0` : name;

  let i = 1;
  while (path.scope.hasBinding(testId) && i < 20) {
    testId = `${name}${i}`;
    i += 1;
  }

  return t.identifier(testId);
};
module.exports.generateNiceId = generateNiceId;

module.exports.createVariable = (
  babel,
  path,
  name,
  init,
  { kind = "const", prefix0 } = {}
) => {
  const { types: t } = babel;
  const id = generateNiceId(babel, path, name, { prefix0 });
  const declaration = t.variableDeclaration(kind, [
    t.variableDeclarator(id, init)
  ]);
  const [declarationPath] = path.pushContainer("body", declaration);
  path.scope.registerDeclaration(declarationPath);
  return id;
};

module.exports.createTopLevelVariable = (babel, path, name, init, idOpts) => {
  const { types: t } = babel;
  const id = generateNiceId(babel, path, name, idOpts);
  const declaration = t.variableDeclaration("const", [
    t.variableDeclarator(id, init)
  ]);
  const statementPath = path.getStatementParent();
  const [declarationPath] = statementPath.insertBefore(declaration);
  statementPath.scope.registerDeclaration(declarationPath);
  return id;
};

const jsonToNode = (babel, object) => {
  const { types: t } = babel;
  if (typeof object === "string") {
    return t.stringLiteral(object);
  } else if (typeof object === "number") {
    return t.numericLiteral(object);
  } else if (Array.isArray(object)) {
    return t.arrayExpression(object.map(element => jsonToNode(babel, element)));
  } else if (object === null) {
    return t.nullLiteral();
  }
  return t.objectExpression(
    Object.keys(object).map(key =>
      t.objectProperty(t.stringLiteral(key), jsonToNode(babel, object[key]))
    )
  );
};
module.exports.jsonToNode = jsonToNode;

const getImportBindings = (
  { types: t },
  path,
  moduleName,
  importedName = "default"
) => {
  const allBindings = Object.values(path.scope.getAllBindingsOfKind("module"));
  const allImportBindings =
    importedName === "default"
      ? allBindings.filter(reference =>
          t.isImportDefaultSpecifier(reference.path.node)
        )
      : allBindings.filter(
          reference =>
            t.isImportSpecifier(reference.path.node) &&
            reference.path.node.imported.name === importedName
        );
  const importBindingsForModule = allImportBindings.filter(reference => {
    const importDeclaration = reference.path.findParent(t.isImportDeclaration);
    const importModuleName = importDeclaration.node.source.value;
    return importModuleName === moduleName;
  });
  return importBindingsForModule;
};
module.exports.getImportBindings = getImportBindings;

const getImportBinding = (babel, path, moduleName, importedName) =>
  getImportBindings(babel, path, moduleName, importedName)[0];
module.exports.getImportBinding = getImportBinding;

module.exports.getOrCreateImport = (
  babel,
  path,
  moduleName,
  importedName = "default",
  { preferredName } = {}
) => {
  const { types: t } = babel;
  const binding = getImportBinding(babel, path, moduleName, importedName);
  if (binding) {
    return t.cloneDeep(binding.identifier);
  }

  let reference;
  if (preferredName != null) {
    reference = generateNiceId(babel, path, preferredName);
  } else if (importedName !== "default") {
    reference = generateNiceId(babel, path, importedName);
  } else {
    const referenceMatch = moduleName.match(/(?:\/|^)([^/]+)$/);
    const referenceName = referenceMatch ? referenceMatch[1] : moduleName;
    reference = generateNiceId(babel, path, referenceName);
  }

  let importSpecifier =
    importedName === "default"
      ? t.importDefaultSpecifier(reference)
      : t.importSpecifier(reference, t.identifier(importedName));

  const importDeclaration = t.importDeclaration(
    [importSpecifier],
    t.stringLiteral(moduleName)
  );

  const programPath = path.findParent(t.isProgram);
  path.scope.getProgramParent().references[reference.name] = true;

  const body = programPath.get("body");
  const importDeclarations = body.filter(t.isImportDeclaration);

  let importDeclarationPaths;
  if (importDeclarations.length !== 0) {
    const lastImportIndex = body.indexOf(
      importDeclarations[importDeclarations.length - 1]
    );
    importDeclarationPaths = programPath
      .get(`body.${lastImportIndex}`)
      .insertAfter(importDeclaration);
  } else {
    importDeclarationPaths = programPath.unshiftContainer(
      "body",
      importDeclaration
    );
  }

  path.scope.registerDeclaration(importDeclarationPaths[0]);

  const newBinding = path.scope.getBinding(reference.name);

  return t.cloneDeep(newBinding.identifier);
};

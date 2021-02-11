type IdOpts = { prefix0?: boolean };

export const generateNiceId = (
  babel: any,
  path: any,
  name: string,
  { prefix0 = false }: IdOpts = {}
) => {
  const { types: t } = babel;

  let testId = prefix0 ? `${name}0` : name;

  let i = 1;
  while (path.scope.hasBinding(testId) && i < 20) {
    testId = `${name}${i}`;
    i += 1;
  }

  return t.identifier(testId);
};

export const createVariable = (
  babel: any,
  path: any,
  name: string,
  init: babel.types.Expression,
  { kind = "const", prefix0 }: { kind?: "const" | "let" } & IdOpts = {}
) => {
  const { types: t } = babel;
  const id = generateNiceId(babel, path, name, { prefix0 });
  const declaration = t.variableDeclaration(kind, [
    t.variableDeclarator(id, init),
  ]);
  const [declarationPath] = path.pushContainer("body", declaration);
  path.scope.registerDeclaration(declarationPath);
  return id;
};

export const createTopLevelVariable = (
  babel: any,
  path: any,
  name: string,
  init: any,
  idOpts?: IdOpts
) => {
  const { types: t } = babel;
  const id = generateNiceId(babel, path, name, idOpts);
  const declaration = t.variableDeclaration("const", [
    t.variableDeclarator(id, init),
  ]);
  const statementPath = path.getStatementParent();
  const [declarationPath] = statementPath.insertBefore(declaration);
  statementPath.scope.registerDeclaration(declarationPath);
  return id;
};

export const jsonToNode = (babel: any, object: any) => {
  const { types: t } = babel;
  if (typeof object === "string") {
    return t.stringLiteral(object);
  } else if (typeof object === "number") {
    return t.numericLiteral(object);
  } else if (Array.isArray(object)) {
    return t.arrayExpression(
      object.map((element) => jsonToNode(babel, element))
    );
  } else if (object === null) {
    return t.nullLiteral();
  }
  return t.objectExpression(
    Object.keys(object).map((key) =>
      t.objectProperty(t.stringLiteral(key), jsonToNode(babel, object[key]))
    )
  );
};

export const getImportBindings = (
  { types: t }: any,
  path: any,
  moduleName: string,
  importedName = "default"
) => {
  const allBindings: any[] = Object.values(
    path.scope.getAllBindingsOfKind("module")
  );
  const allImportBindings =
    importedName === "default"
      ? allBindings.filter((reference) =>
          t.isImportDefaultSpecifier(reference.path.node)
        )
      : allBindings.filter(
          (reference) =>
            t.isImportSpecifier(reference.path.node) &&
            reference.path.node.imported.name === importedName
        );
  const importBindingsForModule = allImportBindings.filter((reference) => {
    const importDeclaration = reference.path.findParent(t.isImportDeclaration);
    const importModuleName = importDeclaration.node.source.value;
    return importModuleName === moduleName;
  });
  return importBindingsForModule;
};

export const getImportBinding = (
  babel: any,
  path: any,
  moduleName: string,
  importedName: string
) => getImportBindings(babel, path, moduleName, importedName)[0];

export const getOrCreateImport = (
  babel: any,
  path: any,
  moduleName: string,
  importedName = "default",
  { preferredName }: { preferredName?: string } = {}
) => {
  const { types: t } = babel;
  const binding = getImportBinding(babel, path, moduleName, importedName);
  if (binding) {
    return t.cloneDeep(binding.identifier);
  }

  let reference: any;
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

  let importDeclarationPaths: any;
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

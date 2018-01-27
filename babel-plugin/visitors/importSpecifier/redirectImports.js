/* eslint-disable no-param-reassign */
const t = require("babel-types");
const _ = require("lodash/fp");

const redirectImports = {
  "cssta/native": {
    VariablesProvider: "cssta/lib/native/VariablesProvider"
  }
};

module.exports = path => {
  const importName = path.node.imported.name;
  const importDeclaration = path.findParent(t.isImportDeclaration);
  const moduleName = importDeclaration.node.source.value;
  const redirect = _.get([moduleName, importName], redirectImports);
  if (!redirect) return;
  const redirectImport = t.importDeclaration(
    [t.importDefaultSpecifier(path.node.local)],
    t.stringLiteral(redirect)
  );
  importDeclaration.insertBefore(redirectImport);

  if (importDeclaration.node.specifiers.length === 1) {
    importDeclaration.remove();
  } else {
    path.remove();
  }
};

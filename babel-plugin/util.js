/* eslint-disable no-param-reassign */
const _ = require("lodash/fp");

const jsonToNode = _.curry((babel, object) => {
  const { types: t } = babel;
  if (typeof object === "string") {
    return t.stringLiteral(object);
  } else if (typeof object === "number") {
    return t.numericLiteral(object);
  } else if (Array.isArray(object)) {
    return t.arrayExpression(object.map(jsonToNode(babel)));
  } else if (object === null) {
    return t.nullLiteral();
  }
  return t.objectExpression(
    Object.keys(object).map(key =>
      t.objectProperty(t.stringLiteral(key), jsonToNode(babel, object[key]))
    )
  );
});
module.exports.jsonToNode = jsonToNode;

module.exports.csstaModules = {
  cssta: "web",
  "cssta/web": "web",
  "cssta/native": "native",
  "cssta/macro": "web",
  // Used in tests
  "../prod.macro": "web"
};

const getImportReferences = ({ types: t }, path, moduleName, importedName) => {
  const allBindings = _.values(path.scope.bindings);
  const allImportBindings =
    importedName === "default"
      ? _.filter(
          reference => t.isImportDefaultSpecifier(reference.path.node),
          allBindings
        )
      : _.filter(
          reference =>
            t.isImportSpecifier(reference.path.node) &&
            reference.path.node.imported.name === importedName,
          allBindings
        );
  const importBindingsForModule = _.filter(reference => {
    const importDeclaration = reference.path.findParent(t.isImportDeclaration);
    return _.get(["source", "value"], importDeclaration.node) === moduleName;
  }, allImportBindings);
  return importBindingsForModule;
};
module.exports.getImportReferences = getImportReferences;

const getImportReference = _.flow(getImportReferences, _.first);
module.exports.getImportReference = getImportReference;
module.exports.getOrCreateImportReference = (
  babel,
  path,
  moduleName,
  importedName
) => {
  const { types: t } = babel;
  const existingReference = getImportReference(
    babel,
    path,
    moduleName,
    importedName
  );
  if (existingReference) return existingReference.path.node.local;

  let reference;
  let importSpecifier;

  if (importedName === "default") {
    const referenceMatch = moduleName.match(/(?:\/|^)([^/]+)$/);
    const referenceName = referenceMatch ? referenceMatch[1] : moduleName;
    reference = path.scope.generateUidIdentifier(referenceName);
    importSpecifier = t.importDefaultSpecifier(reference);
  } else {
    reference = path.scope.generateUidIdentifier(importedName);
    importSpecifier = t.importSpecifier(reference, t.identifier(importedName));
  }

  const importDeclaration = t.importDeclaration(
    [importSpecifier],
    t.stringLiteral(moduleName)
  );

  const program = path.findParent(t.isProgram);
  const [importDeclarationPath] = program.unshiftContainer(
    "body",
    importDeclaration
  );
  program.scope.registerDeclaration(importDeclarationPath);

  return reference;
};

const findOptionsForKey = (optimisations, name) => {
  const optimisation = _.find(
    optimisationName =>
      Array.isArray(optimisationName)
        ? optimisationName[0] === name
        : optimisationName === name,
    optimisations
  );
  if (Array.isArray(optimisation)) return optimisation[1];
  if (optimisation) return {};
  return null;
};
module.exports.getOptimisationOpts = (state, name) => {
  const optimisations = state.opts.optimizations;
  return (
    findOptionsForKey(optimisations, name) ||
    findOptionsForKey(optimisations, "all")
  );
};

const getSubstitutionRegExp = substitutionMap => {
  const substititionNames = Object.keys(substitutionMap);
  const substitionNamesRegExp = new RegExp(
    `(${substititionNames.join("|")})`,
    "g"
  );
  return substitionNamesRegExp;
};
module.exports.getSubstitutionRegExp = getSubstitutionRegExp;

module.exports.containsSubstitution = _.curry(
  (substitutionMap, value) =>
    !_.isEmpty(substitutionMap) &&
    getSubstitutionRegExp(substitutionMap).test(value)
);

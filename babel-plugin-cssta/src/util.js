/* eslint-disable no-param-reassign */
const t = require('babel-types');
const _ = require('lodash/fp');

const jsonToNode = (object) => {
  if (typeof object === 'string') {
    return t.stringLiteral(object);
  } else if (typeof object === 'number') {
    return t.numericLiteral(object);
  } else if (Array.isArray(object)) {
    return t.arrayExpression(object.map(jsonToNode));
  }
  return t.objectExpression(Object.keys(object).map(key => (
    t.objectProperty(
      t.stringLiteral(key),
      jsonToNode(object[key])
    )
  )));
};
module.exports.jsonToNode = jsonToNode;

module.exports.getOrCreateImportReference = (element, state, moduleName, importedName) => {
  const filename = state.file.opts.filename;

  const referencePath = [filename, moduleName, importedName];

  const existingReference = _.get(referencePath, state.importsPerFile);
  if (existingReference) return existingReference;

  let reference;
  let importSpecifier;

  const program = element.findParent(t.isProgram);

  if (importedName === 'default') {
    reference = element.scope.generateUidIdentifier(moduleName);
    importSpecifier = t.importDefaultSpecifier(reference);
  } else {
    reference = element.scope.generateUidIdentifier(importedName);
    importSpecifier = t.importSpecifier(reference, t.identifier(importedName));
  }

  program.unshiftContainer('body', t.importDeclaration([
    importSpecifier,
  ], t.stringLiteral(moduleName)));

  state.importsPerFile = _.set(referencePath, reference, state.importsPerFile);

  return reference;
};

const findOptionsForKey = (optimisations, name) => {
  const optimisation = _.find(optimisationName => (
    Array.isArray(optimisationName) ? optimisationName[0] === name : optimisationName === name
  ), optimisations);
  if (Array.isArray(optimisation)) return optimisation[1];
  if (optimisation) return {};
  return null;
};
module.exports.getOptimisationOpts = (state, name) => {
  const optimisations = state.opts.optimizations;
  return findOptionsForKey(optimisations, name) || findOptionsForKey(optimisations, 'all');
};

module.exports.removeReference = (state, name) => {
  const filename = state.file.opts.filename;
  state.removedRefenceCountPerFile = _.update(
    [filename, name],
    _.add(1),
    state.removedRefenceCountPerFile
  );
};

module.exports.getReferenceCountForImport = (state, name) => {
  const filename = state.file.opts.filename;
  const importElement = _.get([filename, name], state.identifiersFromImportsPerFile);
  const referenceCount = _.getOr(0, ['bindings', name, 'references'], importElement.scope);
  const removedReferenceCount = _.getOr(0, [filename, name], state.removedRefenceCountPerFile);
  return referenceCount - removedReferenceCount;
};

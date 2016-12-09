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


const csstaModules = {
  cssta: 'web',
  'cssta/web': 'web',
  'cssta/native': 'native',
};

module.exports.getCsstaTypeForCallee = (element, callee) => {
  if (!t.isIdentifier(callee)) return null;

  const definitionLocation = _.get([callee.name, 'path'], element.scope.bindings);
  if (!definitionLocation || !t.isImportDefaultSpecifier(definitionLocation)) return null;

  const importDeclaration = definitionLocation.findParent(t.isImportDeclaration);
  if (!importDeclaration) return null;

  const source = importDeclaration.node.source.value;
  const csstaType = csstaModules[source];
  if (!csstaType) return null;

  return csstaType;
};

module.exports.recordImportReference = (element, state) => {
  const moduleName = element.node.source.value;
  const specifiers = element.node.specifiers;

  const filename = state.file.opts.filename;

  _.forEach((specifier) => {
    let importedName;
    if (t.isImportSpecifier(specifier)) {
      importedName = specifier.imported.name;
    } else if (t.isImportDefaultSpecifier(specifier)) {
      importedName = 'default';
    }

    if (importedName) {
      state.importsPerFile = _.set(
        [filename, moduleName, importedName],
        specifier.local,
        state.importsPerFile
      );
      state.identifiersFromImportsPerFile = _.set(
        [filename, specifier.local.name],
        element,
        state.identifiersFromImportsPerFile
      );
    }
  }, specifiers);
};

module.exports.getOrCreateImportReference = (element, state, moduleName, importedName) => {
  const filename = state.file.opts.filename;

  const referencePath = [filename, moduleName, importedName];

  const existingReference = _.get(referencePath, state.importsPerFile);
  if (existingReference) return existingReference;

  let reference;
  let importSpecifier;

  if (importedName === 'default') {
    reference = element.scope.generateUidIdentifier(moduleName);
    importSpecifier = t.importDefaultSpecifier(reference);
  } else {
    reference = element.scope.generateUidIdentifier(importedName);
    importSpecifier = t.importSpecifier(reference, t.identifier(importedName));
  }

  const program = element.findParent(t.isProgram);
  program.unshiftContainer('body', t.importDeclaration([
    importSpecifier,
  ], t.stringLiteral(moduleName)));

  state.importsPerFile = _.set(referencePath, reference, state.importsPerFile);

  return reference;
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

const getSubstitutionRegExp = (substitutionMap) => {
  const substititionNames = Object.keys(substitutionMap);
  const substitionNamesRegExp = new RegExp(`(${substititionNames.join('|')})`, 'g');
  return substitionNamesRegExp;
};
module.exports.getSubstitutionRegExp = getSubstitutionRegExp;

module.exports.containsSubstitution = _.curry((substitutionMap, value) => (
  !_.isEmpty(substitutionMap) && getSubstitutionRegExp(substitutionMap).test(value)
));

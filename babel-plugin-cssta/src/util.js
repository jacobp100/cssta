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

  const existingReference = _.get(referencePath, state.externalReferencesPerFile);
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

  state.externalReferencesPerFile = _.set(
    referencePath,
    reference,
    state.externalReferencesPerFile
  );

  return reference;
};

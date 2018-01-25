/* eslint-disable no-param-reassign */
const t = require("babel-types");
const _ = require("lodash/fp");
const { csstaModules, getImportReferences } = require("../../util");

module.exports = path => {
  const unreferencedCsstaImportReferences = _.flow(
    _.flatMap(moduleName => getImportReferences(path, moduleName, "default")),
    _.filter({ references: 0 })
  )(_.keys(csstaModules));

  _.forEach(reference => {
    const importDeclaration = reference.path.findParent(t.isImportDeclaration);
    importDeclaration.remove();
  }, unreferencedCsstaImportReferences);
};

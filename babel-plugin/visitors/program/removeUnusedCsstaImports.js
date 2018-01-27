/* eslint-disable no-param-reassign */
const _ = require("lodash/fp");
const { csstaModules, getImportReferences } = require("../../util");

module.exports = (babel, path) => {
  const unreferencedCsstaImportReferences = _.flow(
    _.flatMap(moduleName =>
      getImportReferences(babel, path, moduleName, "default")
    ),
    _.filter({ references: 0 })
  )(_.keys(csstaModules));

  _.forEach(reference => {
    const importDeclaration = reference.path.findParent(
      babel.types.isImportDeclaration
    );
    importDeclaration.remove();
  }, unreferencedCsstaImportReferences);
};

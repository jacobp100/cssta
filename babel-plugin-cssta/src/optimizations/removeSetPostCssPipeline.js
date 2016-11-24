/* eslint-disable no-param-reassign */
const t = require('babel-types');
const _ = require('lodash/fp');

module.exports = (element, state, arg) => {
  const filename = state.file.opts.filename;

  if (!t.isArrayExpression(arg)) {
    throw new Error('Expected argument to setPostCssPipeline to be an array');
  }

  const localNames = _.flow(
    _.filter(t.isCallExpression),
    _.map('callee.name')
  )(arg.elements);

  let identifiersFromImports = state.identifiersFromImportsPerFile[filename] || {};
  _.forEach((localName) => {
    const importElement = identifiersFromImports[localName];
    if (importElement) {
      importElement.remove();
      identifiersFromImports = _.unset(localName, identifiersFromImports);
    }
  }, localNames);

  element.remove();

  state.identifiersFromImportsPerFile[filename] = identifiersFromImports;
};

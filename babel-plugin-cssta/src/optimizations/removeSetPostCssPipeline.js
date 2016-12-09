/* eslint-disable no-param-reassign */
const t = require('babel-types');
const _ = require('lodash/fp');

module.exports = (path) => {
  const { arguments: [arg], callee } = path.node;

  if (!t.isArrayExpression(arg)) {
    throw new Error('Expected argument to setPostCssPipeline to be an array');
  }

  const bindingIdentifiers = _.flow(
    _.filter(t.isCallExpression),
    _.map('callee.name'),
    _.map(_.propertyOf(path.scope.bindings)),
    _.filter({ references: 1 }),
    _.map('path')
  )(arg.elements);

  _.forEach((importSpecifier) => {
    const importDeclaration = importSpecifier.findParent(t.isImportDeclaration);
    if (importDeclaration.node.specifiers.length === 1) {
      importDeclaration.remove();
      // importDeclaration.path.remove();
    } else {
      importSpecifier.remove();
      // importDeclaration.path.remove();
    }
  }, bindingIdentifiers);

  const binding = path.scope.getBinding(callee.object.name);
  binding.dereference();

  path.remove();
};

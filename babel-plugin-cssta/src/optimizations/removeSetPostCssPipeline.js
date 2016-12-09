/* eslint-disable no-param-reassign */
const t = require('babel-types');
const _ = require('lodash/fp');
const { removeReference } = require('../util');

module.exports = (element, state, node) => {
  const { arguments: [arg], callee } = node;

  if (!t.isArrayExpression(arg)) {
    throw new Error('Expected argument to setPostCssPipeline to be an array');
  }

  const bindingIdentifiers = _.flow(
    _.filter(t.isCallExpression),
    _.map('callee.name'),
    _.map(_.propertyOf(element.scope.bindings)),
    _.filter({ references: 1 }),
    _.map('path')
  )(arg.elements);

  _.forEach((importSpecifier) => {
    const importDeclaration = importSpecifier.findParent(t.isImportDeclaration);
    if (importDeclaration.node.specifiers.length === 1) {
      importDeclaration.remove();
    } else {
      importSpecifier.remove();
    }
  }, bindingIdentifiers);

  removeReference(state, callee.object.name);
  element.remove();
};

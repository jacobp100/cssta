/* eslint-disable no-param-reassign */
const t = require('babel-types');
const _ = require('lodash/fp');
const { removeReference } = require('../util');

module.exports = (element, state, node) => {
  const { arguments: [arg], callee } = node;

  if (!t.isArrayExpression(arg)) {
    throw new Error('Expected argument to setPostCssPipeline to be an array');
  }

  const localNames = _.flow(
    _.filter(t.isCallExpression),
    _.map('callee.name')
  )(arg.elements);

  _.forEach((localName) => {
    removeReference(state, localName);
  }, localNames);

  removeReference(state, callee.object.name);
  element.remove();
};

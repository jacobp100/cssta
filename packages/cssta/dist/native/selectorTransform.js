'use strict';

// We generate babel nodes that represent a validation function
// In prod, we use the babel nodes to make a function
// In dev, we eval to generate a function

var selectorParser = require('postcss-selector-parser');

var propArg = 'p';

var createLogicalValidator = function createLogicalValidator(nodes, operator) {
  if (nodes.length === 0) throw new Error('Cannot construct logical validaton');
  var nodeValidators = nodes.map(createValidator) // eslint-disable-line
  .filter(function (validator) {
    return validator !== null;
  });
  if (nodeValidators.length === 0) return null;
  return nodeValidators.slice(1).reduce(function (accum, validator) {
    return '(' + accum + ' ' + operator + ' ' + validator + ')';
  }, nodeValidators[0]);
};

var createNestingValidator = function createNestingValidator() {
  return null;
};

var createAttributeValidator = function createAttributeValidator(node) {
  var attribute = node.attribute,
      raws = node.raws,
      value = node.value;


  var memberExpression = propArg + '[\'' + attribute.trim() + '\']';

  if (!value) return '!!' + memberExpression;

  var unquoted = raws.unquoted.trim();
  return '(' + memberExpression + ' === \'' + unquoted + '\')';
};

var createPseudoValidator = function createPseudoValidator(node) {
  var value = node.value,
      nodes = node.nodes;


  if (value === ':matches') {
    return createLogicalValidator(nodes, '||');
  } else if (value === ':not') {
    var baseValidator = createLogicalValidator(nodes, '||');
    return '!' + baseValidator;
  }
  throw new Error('Invalid selector part: ' + node);
};

var createSelectorValidator = function createSelectorValidator(node) {
  return createLogicalValidator(node.nodes, '&&');
};

var validators = {
  nesting: createNestingValidator,
  attribute: createAttributeValidator,
  pseudo: createPseudoValidator,
  selector: createSelectorValidator,
  root: createSelectorValidator
};

var createValidator = function createValidator(node) {
  if (!(node.type in validators)) throw new Error('Invalid selector part: ' + node);
  return validators[node.type](node);
};

var getBaseValidatorSourceForSelector = function getBaseValidatorSourceForSelector(selector) {
  var selectorNode = void 0;
  selectorParser(function (node) {
    selectorNode = node;
  }).process(selector);
  var validatorNode = createValidator(selectorNode) || 'true';
  var returnNode = 'return ' + validatorNode + ';';
  return returnNode;
};

module.exports.getValidatorSourceForSelector = function (selector) {
  return '(function(' + propArg + ') {' + getBaseValidatorSourceForSelector(selector) + '})';
};

module.exports.createValidatorForSelector = function (selector) {
  var source = getBaseValidatorSourceForSelector(selector);
  return new Function(propArg, source); // eslint-disable-line
};
// We generate babel nodes that represent a validation function
// In prod, we use the babel nodes to make a function
// In dev, we eval to generate a function

const selectorParser = require('postcss-selector-parser');
const t = require('babel-types');
const { default: generate } = require('babel-generator');

const propArg = 'p';

const createLogicalValidator = (nodes, operator) => {
  if (nodes.length === 0) throw new Error('Cannot construct logical validaton');
  const nodeValidators = nodes
    .map(createValidator) // eslint-disable-line
    .filter(validator => validator !== null);
  if (nodeValidators.length === 0) return null;
  return nodeValidators.slice(1).reduce((accum, validator) => (
    t.logicalExpression(operator, accum, validator)
  ), nodeValidators[0]);
};

const createNestingValidator = () => null;

const createAttributeValidator = (node) => {
  const { attribute, raws, value } = node;

  const memberExpression = t.memberExpression(
    t.identifier(propArg),
    t.stringLiteral(attribute.trim()),
    true
  );

  if (!value) {
    return t.unaryExpression('!', t.unaryExpression('!', memberExpression, true), true);
  }

  const unquoted = raws.unquoted.trim();
  return t.binaryExpression('===', memberExpression, t.stringLiteral(unquoted));
};

const createPseudoValidator = (node) => {
  const { value, nodes } = node;

  if (value === ':matches') {
    return createLogicalValidator(nodes, '||');
  } else if (value === ':not') {
    const baseValidator = createLogicalValidator(nodes, '||');
    return t.unaryExpression('!', baseValidator, true);
  }
  throw new Error(`Invalid selector part: ${node}`);
};

const createSelectorValidator = node => createLogicalValidator(node.nodes, '&&');

const validators = {
  nesting: createNestingValidator,
  attribute: createAttributeValidator,
  pseudo: createPseudoValidator,
  selector: createSelectorValidator,
  root: createSelectorValidator,
};

const createValidator = (node) => {
  if (!(node.type in validators)) throw new Error(`Invalid selector part: ${node}`);
  return validators[node.type](node);
};

const createBaseValidatorNodeForSelector = (selector) => {
  let selectorNode;
  selectorParser((node) => { selectorNode = node; }).process(selector);
  const validatorNode = createValidator(selectorNode) || t.booleanLiteral(true);
  const returnNode = t.returnStatement(validatorNode);
  return returnNode;
};

module.exports.createValidatorNodeForSelector = (selector) => {
  const baseValidatorNode = createBaseValidatorNodeForSelector(selector);
  const prop = t.identifier(propArg);
  const body = t.blockStatement([baseValidatorNode]);
  return t.functionExpression(null, [prop], body);
};
module.exports.createValidatorForSelector = (selector) => {
  const baseValidatorNode = createBaseValidatorNodeForSelector(selector);
  const source = generate(baseValidatorNode).code;
  return new Function(propArg, source); // eslint-disable-line
};

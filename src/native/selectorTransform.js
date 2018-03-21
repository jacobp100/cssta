// @flow
// We generate babel nodes that represent a validation function
// In prod, we use the babel nodes to make a function
// In dev, we eval to generate a function

const selectorParser = require("postcss-selector-parser");

const propArg = "p";

const createLogicalValidator = (nodes, operator) => {
  if (nodes.length === 0) throw new Error("Cannot construct logical validaton");
  const nodeValidators = nodes
    .map(createValidator) // eslint-disable-line
    .filter(validator => validator !== null);
  if (nodeValidators.length === 0) return null;
  return nodeValidators
    .slice(1)
    .reduce(
      (accum, validator) => `(${accum} ${operator} ${validator})`,
      nodeValidators[0]
    );
};

const createNestingValidator = () => null;

const createAttributeValidator = node => {
  const { raws, value } = node;
  const attribute = node.attribute.trim();
  if (attribute[0] !== "*") {
    throw new Error(
      `You can only use prop selectors (did you forget an @ before ${attribute})`
    );
  }

  const prop = attribute.slice(1);
  const memberExpression = `${propArg}[${JSON.stringify(prop)}]`;

  if (!value) return `(${memberExpression} === true)`;

  const unquoted = raws.unquoted.trim();
  return `(${memberExpression} === ${JSON.stringify(unquoted)})`;
};

const createPseudoValidator = node => {
  const { value, nodes } = node;

  if (value === ":matches") {
    return createLogicalValidator(nodes, "||");
  } else if (value === ":not") {
    const baseValidator = createLogicalValidator(nodes, "||");
    return baseValidator ? `!${baseValidator}` : null;
  }
  throw new Error(`Invalid selector part: ${node}`);
};

const createSelectorValidator = node =>
  createLogicalValidator(node.nodes, "&&");

const validators = {
  nesting: createNestingValidator,
  attribute: createAttributeValidator,
  pseudo: createPseudoValidator,
  selector: createSelectorValidator,
  root: createSelectorValidator
};

const createValidator = node => {
  if (!(node.type in validators))
    throw new Error(`Invalid selector part: ${node}`);
  return validators[node.type](node);
};

const createMediaFeatureValidator = query => {
  const match = query.match(/^\s*\(\s*([\w-]+)\s*:\s*(\w+)\s*\)\s*$/);

  if (match == null) throw new Error(`Could not parse media query: ${query}`);

  switch (match[1]) {
    case "width":
      return `(${parseInt(match[2], 10)} === ${propArg}.$ScreenWidth)`;
    case "min-width":
      return `(${parseInt(match[2], 10)} < ${propArg}.$ScreenWidth)`;
    case "max-width":
      return `(${parseInt(match[2], 10)} > ${propArg}.$ScreenWidth)`;
    case "height":
      return `(${parseInt(match[2], 10)} === ${propArg}.$ScreenHeight)`;
    case "min-height":
      return `(${parseInt(match[2], 10)} < ${propArg}.$ScreenHeight)`;
    case "max-height":
      return `(${parseInt(match[2], 10)} > ${propArg}.$ScreenHeight)`;
    case "aspect-ratio": {
      const [w, h] = match[2].split("/").map(Number);
      return `(${w} / ${h} === ${propArg}.$ScreenWidth / ${propArg}.$ScreenHeight)`;
    }
    case "min-aspect-ratio": {
      const [w, h] = match[2].split("/").map(Number);
      return `(${w} / ${h} < ${propArg}.$ScreenWidth / ${propArg}.$ScreenHeight)`;
    }
    case "max-aspect-ratio": {
      const [w, h] = match[2].split("/").map(Number);
      return `(${w} / ${h} > ${propArg}.$ScreenWidth / ${propArg}.$ScreenHeight)`;
    }
    case "orientation":
      if (/landscape/i.test(match[2])) {
        return `(${propArg}.$ScreenWidth > ${propArg}.$ScreenHeight)`;
      } else if (/portrait/i.test(match[2])) {
        return `(${propArg}.$ScreenWidth < ${propArg}.$ScreenHeight)`;
      }
    // fallthrough
    default:
      throw new Error(`Could not parse media query: ${query}`);
  }
};

const getBaseValidatorSourceForSelector = (selector, mediaQuery) => {
  let selectorNode;
  selectorParser(node => {
    selectorNode = node;
  }).process(selector);
  if (!selectorNode) throw new Error("Expected to parse selector");

  let validatorNode = createValidator(selectorNode) || "true";
  if (mediaQuery != null) {
    validatorNode = (mediaQuery.match(/\([^()]+\)/g) || []).reduce(
      (accum, query) => `(${accum} && ${createMediaFeatureValidator(query)})`,
      validatorNode
    );
  }

  const returnNode = `return ${validatorNode};`;
  return returnNode;
};

module.exports.getValidatorSourceForSelector = (
  selector /*: string */,
  mediaQuery /*: ?string */
) =>
  `(function(${propArg}) {${getBaseValidatorSourceForSelector(
    selector,
    mediaQuery
  )}})`;

module.exports.createValidatorForSelector = (
  selector /*: string */,
  mediaQuery /*: ?string */
) /*: (props: Object) => boolean */ => {
  const source = getBaseValidatorSourceForSelector(selector, mediaQuery);
  /* eslint-disable no-new-func */
  // $FlowFixMe
  const validator /*: (props: Object) => boolean */ = new Function(
    propArg,
    source
  ); // eslint-disable-line
  /* eslint-enable */
  return validator;
};

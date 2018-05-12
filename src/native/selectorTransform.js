// @flow
// We generate babel nodes that represent a validation function
// In prod, we use the babel nodes to make a function
// In dev, we eval to generate a function

const selectorParser = require("postcss-selector-parser");

const propArg = "p";

/*::
type SelectorNode = {
  type: string,
  value: any,
  attribute: string,
  raws: any,
  nodes: SelectorNode[],
  toString: () => string,
}

type Validator = ?string
*/

const combineLogicalValidators = (
  validators /*: Validator[] */,
  operator /*: string */
) /*: Validator */ => {
  if (validators.length === 0) {
    throw new Error("Cannot construct logical validaton");
  }
  // $FlowFixMe
  const nodeValidators /*: string[] */ = validators.filter(v => v != null);
  if (nodeValidators.length === 0) return null;
  return nodeValidators
    .slice(1)
    .reduce(
      (accum, validator) => `(${accum} ${operator} ${validator})`,
      nodeValidators[0]
    );
};

const createLogicalValidator = (nodes, operator) =>
  combineLogicalValidators(nodes.map(createValidator), operator); // eslint-disable-line

const createAlwaysTrueValidator = () /*: Validator */ => null;

const createAttributeValidator = (
  node /*: SelectorNode */
) /*: Validator */ => {
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

const createPseudoValidator = (node /*: SelectorNode */) /*: Validator */ => {
  const { value, nodes } = node;

  if (value === ":matches") {
    return createLogicalValidator(nodes, "||");
  } else if (value === ":not") {
    const baseValidator = createLogicalValidator(nodes, "||");
    return baseValidator ? `!${baseValidator}` : null;
  }
  throw new Error(`Invalid selector part: ${node.toString()}`);
};

const createSelectorValidator = (node /*: SelectorNode */) /* Validator */ =>
  createLogicalValidator(node.nodes, "&&");

const validators = {
  universal: createAlwaysTrueValidator,
  nesting: createAlwaysTrueValidator,
  attribute: createAttributeValidator,
  pseudo: createPseudoValidator,
  selector: createSelectorValidator,
  root: createSelectorValidator
};

const createValidator = (node /*: SelectorNode */) /*: Validator */ => {
  if (!(node.type in validators)) {
    throw new Error(`Invalid selector part: ${node.toString()}`);
  }
  return validators[node.type](node);
};

const aspectRatioWH = str =>
  str
    .split("/")
    .map(x => x.trim())
    .map(Number);

const createMediaFeatureValidator = query => {
  const match = query.match(/^\s*\(\s*([\w-]+)\s*:\s*(\S+(?:\s\S)*)\s*\)\s*$/);

  if (match == null) throw new Error(`Could not parse media query: ${query}`);

  switch (match[1]) {
    case "platform":
      return `(${JSON.stringify(
        match[2].toLowerCase()
      )} === ${propArg}.$Platform)`;
    case "width":
      return `(${parseInt(match[2], 10)} === ${propArg}.$ScreenWidth)`;
    case "min-width":
      return `(${parseInt(match[2], 10)} <= ${propArg}.$ScreenWidth)`;
    case "max-width":
      return `(${parseInt(match[2], 10)} >= ${propArg}.$ScreenWidth)`;
    case "height":
      return `(${parseInt(match[2], 10)} === ${propArg}.$ScreenHeight)`;
    case "min-height":
      return `(${parseInt(match[2], 10)} <= ${propArg}.$ScreenHeight)`;
    case "max-height":
      return `(${parseInt(match[2], 10)} >= ${propArg}.$ScreenHeight)`;
    case "aspect-ratio": {
      const [w, h] = aspectRatioWH(match[2]);
      return `(${w} / ${h} === ${propArg}.$ScreenWidth / ${propArg}.$ScreenHeight)`;
    }
    case "min-aspect-ratio": {
      const [w, h] = aspectRatioWH(match[2]);
      return `(${w} / ${h} <= ${propArg}.$ScreenWidth / ${propArg}.$ScreenHeight)`;
    }
    case "max-aspect-ratio": {
      const [w, h] = aspectRatioWH(match[2]);
      return `(${w} / ${h} >= ${propArg}.$ScreenWidth / ${propArg}.$ScreenHeight)`;
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

const createMediaQueryPartValidator = queryPart =>
  combineLogicalValidators(
    (queryPart.match(/\([^()]+\)/g) || []).map(createMediaFeatureValidator),
    "&&"
  );

const createMediaQueryValidator = mediaQuery => {
  if (mediaQuery == null) return null;
  const mediaQueryValidators = mediaQuery
    .split(",")
    .map(createMediaQueryPartValidator);
  const mediaQueryValidator = combineLogicalValidators(
    mediaQueryValidators,
    "||"
  );
  return mediaQueryValidator;
};

const getBaseValidatorSourceForSelector = (selector, mediaQuery) => {
  let selectorNode;
  selectorParser(node => {
    selectorNode = node;
  }).process(selector);
  if (!selectorNode) throw new Error("Expected to parse selector");

  const validatorNode = combineLogicalValidators(
    [createValidator(selectorNode), createMediaQueryValidator(mediaQuery)],
    "&&"
  );

  const returnNode = `return ${validatorNode || "true"};`;
  // console.log(returnNode);
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

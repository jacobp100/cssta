// @flow
const selectorParser = require("postcss-selector-parser");

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
  babel,
  operator /*: string */,
  validators /*: Validator[] */
) /*: Validator */ => {
  const { types: t } = babel;
  if (validators.length === 0) {
    throw new Error("Cannot construct logical validaton");
  }
  // $FlowFixMe
  const nodeValidators /*: string[] */ = validators.filter(v => v != null);
  if (nodeValidators.length === 0) return null;
  return nodeValidators
    .slice(1)
    .reduce(
      (accum, validator) => t.logicalExpression(operator, accum, validator),
      nodeValidators[0]
    );
};

const createLogicalValidator = (babel, operator, nodes) =>
  combineLogicalValidators(
    babel,
    operator,
    nodes.map(node => createValidator(babel, node))
  ); // eslint-disable-line

const createAlwaysTrueValidator = () /*: Validator */ => null;

const createAttributeValidator = (
  babel,
  node /*: SelectorNode */
) /*: Validator */ => {
  const { types: t } = babel;
  const { value } = node;
  const attribute = node.attribute.trim();
  if (node.ns !== "cssta") {
    throw new Error(
      `You can only use prop selectors (did you forget an @ before ${attribute})`
    );
  }

  const prop = t.identifier(attribute);
  const valueNode = value
    ? t.stringLiteral(value.trim())
    : t.booleanLiteral(true);

  return t.binaryExpression("===", prop, valueNode);
};

const createPseudoValidator = (
  babel,
  node /*: SelectorNode */
) /*: Validator */ => {
  const { types: t } = babel;
  const { value, nodes } = node;

  if (value === ":matches") {
    return createLogicalValidator(babel, "||", nodes);
  } else if (value === ":not") {
    const baseValidator = createLogicalValidator(babel, "||", nodes);
    return baseValidator ? t.unaryExpression("!", baseValidator) : null;
  }
  throw new Error(`Invalid selector part: ${node.toString()}`);
};

const validators = {
  universal: createAlwaysTrueValidator,
  nesting: createAlwaysTrueValidator,
  attribute: createAttributeValidator,
  pseudo: createPseudoValidator,
  selector: (babel, node /*: SelectorNode */) /* Validator */ =>
    createLogicalValidator(babel, "&&", node.nodes),
  root: (babel, node /*: SelectorNode */) /* Validator */ =>
    createLogicalValidator(babel, "||", node.nodes)
};

const createValidator = (babel, node /*: SelectorNode */) /*: Validator */ => {
  if (!(node.type in validators)) {
    throw new Error(`Invalid selector part: ${node.toString()}`);
  }
  return validators[node.type](babel, node);
};

const aspectRatioWH = ({ types: t }, str) => {
  const [w, h] = str
    .split("/")
    .map(x => x.trim())
    .map(Number);
  return t.binaryExpression("/", t.numericLiteral(w), t.numericLiteral(h));
};

const createMediaFeatureValidator = (babel, path, query, env) => {
  const { types: t } = babel;
  const match = query.match(/^\s*\(\s*([\w-]+)\s*:\s*(\S+(?:\s\S)*)\s*\)\s*$/);

  if (match == null) throw new Error(`Could not parse media query: ${query}`);

  switch (match[1]) {
    case "platform":
      return t.binaryExpression(
        "===",
        env.getPlatform(),
        t.stringLiteral(match[2])
      );
    case "prefers-color-scheme":
      return t.binaryExpression(
        "===",
        env.getColorScheme(),
        t.stringLiteral(match[2])
      );
    case "width":
      return t.binaryExpression(
        "===",
        env.getWindowWidth(),
        t.numericLiteral(parseInt(match[2], 10))
      );
    case "min-width":
      return t.binaryExpression(
        ">=",
        env.getWindowWidth(),
        t.numericLiteral(parseInt(match[2], 10))
      );
    case "max-width":
      return t.binaryExpression(
        "<=",
        env.getWindowWidth(),
        t.numericLiteral(parseInt(match[2], 10))
      );
    case "height":
      return t.binaryExpression(
        "===",
        env.getWindowHeight(),
        t.numericLiteral(parseInt(match[2], 10))
      );
    case "min-height":
      return t.binaryExpression(
        ">=",
        env.getWindowHeight(),
        t.numericLiteral(parseInt(match[2], 10))
      );
    case "max-height":
      return t.binaryExpression(
        "<=",
        env.getWindowHeight(),
        t.numericLiteral(parseInt(match[2], 10))
      );
    case "aspect-ratio": {
      return t.binaryExpression(
        "===",
        aspectRatioWH(babel, match[2]),
        t.binaryExpression("/", env.getWindowWidth(), env.getWindowHeight())
      );
    }
    case "min-aspect-ratio": {
      return t.binaryExpression(
        "<=",
        aspectRatioWH(babel, match[2]),
        t.binaryExpression("/", env.getWindowWidth(), env.getWindowHeight())
      );
    }
    case "max-aspect-ratio": {
      return t.binaryExpression(
        ">=",
        aspectRatioWH(babel, match[2]),
        t.binaryExpression("/", env.getWindowWidth(), env.getWindowHeight())
      );
    }
    case "orientation": {
      if (/landscape/i.test(match[2])) {
        return t.binaryExpression(
          ">",
          env.getWindowWidth(),
          env.getWindowHeight()
        );
      } else if (/portrait/i.test(match[2])) {
        return t.binaryExpression(
          "<",
          env.getWindowWidth(),
          env.getWindowHeight()
        );
      }
    }
    // fallthrough
    default:
      throw new Error(`Could not parse media query: ${query}`);
  }
};

const createMediaQueryValidator = (babel, path, mediaQuery, environment) => {
  if (mediaQuery == null) return null;

  const createMediaQueryPartValidator = queryPart =>
    combineLogicalValidators(
      babel,
      "&&",
      (queryPart.match(/\([^()]+\)/g) || []).map(query =>
        createMediaFeatureValidator(babel, path, query, environment)
      )
    );

  const mediaQueryValidators = mediaQuery
    .split(",")
    .map(createMediaQueryPartValidator);
  const mediaQueryValidator = combineLogicalValidators(
    babel,
    "||",
    mediaQueryValidators
  );
  return mediaQueryValidator;
};

const selectorTransform = (
  babel,
  path,
  { selector, mediaQuery },
  { environment }
) => {
  let selectorNode;
  selectorParser(node => {
    selectorNode = node;
  }).processSync(selector);
  if (!selectorNode) throw new Error("Expected to parse selector");

  const validatorNode = combineLogicalValidators(babel, "&&", [
    createValidator(babel, selectorNode),
    createMediaQueryValidator(babel, path, mediaQuery, environment)
  ]);

  return validatorNode;
};

module.exports = (babel, path, { rules }, params) => {
  const selectorFunctions = rules.reduce((accum, rule) => {
    const ruleCondition = selectorTransform(babel, path, rule, params);
    if (ruleCondition != null) accum.set(rule, ruleCondition);
    return accum;
  }, new Map());

  return selectorFunctions;
};

module.exports.selectorTransform = selectorTransform;

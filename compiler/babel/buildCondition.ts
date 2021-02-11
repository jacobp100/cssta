/* eslint-disable @typescript-eslint/no-use-before-define */
import selectorParser, { Node } from "postcss-selector-parser";
import { Condition } from "../css/types";
import { Environment } from "./environment";

type Validator = any | null;

const combineLogicalValidators = (
  babel: any,
  operator: string,
  validators: Validator[]
): Validator => {
  const { types: t } = babel;
  if (validators.length === 0) {
    throw new Error("Cannot construct logical validaton");
  }
  const nodeValidators: string[] = validators.filter((v) => v != null);
  if (nodeValidators.length === 0) return null;
  return nodeValidators
    .slice(1)
    .reduce(
      (accum, validator) => t.logicalExpression(operator, accum, validator),
      nodeValidators[0]
    );
};

const createLogicalValidator = (babel: any, operator: string, nodes: Node[]) =>
  combineLogicalValidators(
    babel,
    operator,
    nodes.map((node) => createValidator(babel, node))
  ); // eslint-disable-line

const createValidator = (babel: any, node: Node): Validator => {
  const { types: t } = babel;

  switch (node.type) {
    case "universal":
      return null;
    case "nesting":
      return null;
    case "attribute": {
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
    }
    case "pseudo": {
      const { value, nodes } = node;

      if (value === ":matches") {
        return createLogicalValidator(babel, "||", nodes);
      } else if (value === ":not") {
        const baseValidator = createLogicalValidator(babel, "||", nodes);
        return baseValidator ? t.unaryExpression("!", baseValidator) : null;
      }
      throw new Error(`Invalid selector part: ${node.toString()}`);
    }
    case "selector":
      return createLogicalValidator(babel, "&&", node.nodes);
    case "root":
      return createLogicalValidator(babel, "||", node.nodes);
    default:
      return null;
  }
};

const aspectRatioWH = ({ types: t }, str: string) => {
  const [w, h] = str
    .split("/")
    .map((x) => x.trim())
    .map(Number);
  return t.binaryExpression("/", t.numericLiteral(w), t.numericLiteral(h));
};

const createMediaFeatureValidator = (
  babel: any,
  query: string,
  env: Environment
) => {
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

const createMediaQueryValidator = (
  babel: any,
  mediaQuery: string,
  environment: Environment
) => {
  if (mediaQuery == null) return null;

  const createMediaQueryPartValidator = (queryPart: string) =>
    combineLogicalValidators(
      babel,
      "&&",
      (queryPart.match(/\([^()]+\)/g) || []).map((query) =>
        createMediaFeatureValidator(babel, query, environment)
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

export default (
  babel: any,
  { selector, mediaQuery }: Condition,
  environment: Environment
) => {
  let selectorNode: Node;
  selectorParser((node) => {
    selectorNode = node;
  }).processSync(selector);
  if (!selectorNode) throw new Error("Expected to parse selector");

  const validatorNode = combineLogicalValidators(babel, "&&", [
    createValidator(babel, selectorNode),
    createMediaQueryValidator(babel, mediaQuery, environment),
  ]);

  return validatorNode;
};

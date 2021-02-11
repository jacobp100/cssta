/* eslint-disable no-param-reassign */
import postcss, { Root, AtRule, Node } from "postcss";
import selectorParser from "postcss-selector-parser";
import { keyframesRegExp, isDirectChildOfKeyframes } from "./util";
import { PropTypes } from "./types";

// Don't use root.each, because when we remove nodes, we'll skip them
const iterateChildren = (
  root: Root | AtRule,
  callback: (node: Node) => void
) => {
  const iterate = (node: Node | void) => {
    if (!node) return;
    const nextNode = node.next();
    callback(node);
    iterate(nextNode);
  };

  iterate(root.first);
};

const nestInAmpersandSelector = (node: Node) => {
  const prevNode = node.prev();
  if (prevNode && prevNode.type === "rule" && prevNode.selector === "&") {
    prevNode.append(node);
  } else {
    const ruleNode = postcss.rule({ selector: "&" });
    node.before(ruleNode);
    ruleNode.append(node);
  }
};

const nestNode = (node: Node) => {
  switch (node.type) {
    case "decl": {
      nestInAmpersandSelector(node);
      break;
    }
    case "atrule": {
      if (node.name === "include") {
        nestInAmpersandSelector(node);
      } else if (!keyframesRegExp.test(node.name)) {
        iterateChildren(node, nestNode);
      }
      break;
    }
    default:
      break;
  }
};

export default (
  inputCss: string,
  allowCombinators = false
): { root: Root; propTypes: PropTypes } => {
  const transformedInput = inputCss.replace(/(\[\s*)@(\w)/g, `$1cssta|$2`);
  const root = postcss.parse(transformedInput);

  iterateChildren(root, nestNode);

  const propTypes = {};
  const validateAndTransformSelectors = selectorParser((container) => {
    container.each((selector) => {
      if (selector.type !== "selector") {
        throw new Error("Expected selector");
      }

      let didScopeNode = false;

      selector.walk((node) => {
        if (node.type === "combinator" && !allowCombinators) {
          throw new Error("Invalid use of combinator in selector");
        } else if (node.type === "nesting") {
          didScopeNode = true;
        } else if (node.type === "attribute" && node.ns === "cssta") {
          const isInNot =
            node.parent.parent.type === "pseudo" &&
            node.parent.parent.value === ":not";
          const nodeThatMustBeTiedToNesting = isInNot
            ? node.parent.parent.parent
            : node.parent;
          const isTiedToNesting = nodeThatMustBeTiedToNesting.nodes.some(
            (child) => child.type === "nesting"
          );

          if (!isTiedToNesting) {
            throw new Error(
              'Prop selectors ([@prop]) must be scoped using an "&"'
            );
          }

          const prop = node.attribute.trim();
          const propType = node.value ? "oneOf" : "bool";

          if (propType === "oneOf" && node.operator !== "=") {
            throw new Error(
              `You cannot use operator ${node.operator} in a prop selector`
            );
          }

          if (propType === "oneOf" && node.insensitive) {
            throw new Error("You cannot use case-insensitive prop selectors");
          }

          if (prop === "component") {
            throw new Error('You cannot name an prop "component"');
          }

          if (!(prop in propTypes)) {
            propTypes[prop] = { type: propType };
          } else if (propTypes[prop].type !== propType) {
            throw new Error(`Prop "${prop}" defined as both bool and a string`);
          }

          if (propType === "oneOf") {
            const value = node.value.trim();
            const nextValues = new Set(propTypes[prop].values || []);
            nextValues.add(value);
            propTypes[prop].values = Array.from(nextValues);
          }
        }
      });

      if (!didScopeNode) {
        throw new Error('You must use "&" in every selector');
      }
    });
  });

  root.walkRules((rule) => {
    if (!isDirectChildOfKeyframes(rule)) {
      rule.selector = validateAndTransformSelectors.processSync(rule.selector);
    }
  });

  return { root, propTypes };
};

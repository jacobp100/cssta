/* eslint-disable no-param-reassign */
const postcss = require('postcss');
const selectorParser = require('postcss-selector-parser');
const { transformAnimationNames } = require('postcss-transform-animations');


// Don't use root.each, because when we remove nodes, we'll skip them
const iterateSiblings = (root, callback) => {
  const iterate = (node) => {
    if (!node) return;
    const nextNode = node.next();
    callback(node);
    iterate(nextNode);
  };

  iterate(root.first);
};

module.exports = (inputCss, { generateClassName, generateAnimationName }) => {
  const classNameMap = {};
  const animationNameMap = {};

  let baseClassName = null;
  const getBaseClassName = () => {
    if (!baseClassName) baseClassName = generateClassName();
    return baseClassName;
  };

  const getBooleanClassNameFor = (attribute) => {
    if (!classNameMap[attribute]) {
      classNameMap[attribute] = generateClassName();
    } else if (typeof classNameMap[attribute] !== 'string') {
      throw new Error(`Attribute ${attribute} is defined as both a boolean and a string`);
    }
    return classNameMap[attribute];
  };

  const getStringClassNameFor = (attribute, value) => {
    if (!classNameMap[attribute]) {
      classNameMap[attribute] = {};
    } else if (typeof classNameMap[attribute] !== 'object') {
      throw new Error(`Attribute ${attribute} is defined as both a boolean and a string`);
    }

    if (!classNameMap[attribute][value]) {
      classNameMap[attribute][value] = generateClassName();
    }

    return classNameMap[attribute][value];
  };

  const transformSelectors = (container) => {
    container.each((selector) => {
      let didScopeNode = false;

      container.walkNesting((node) => {
        const className = getBaseClassName();
        const replacementNode = selectorParser.className({ value: className });
        node.replaceWith(replacementNode);
        didScopeNode = true;
      });

      selector.walkAttributes((node) => {
        const attribute = node.attribute.trim();
        const className = node.value
          ? getStringClassNameFor(attribute, node.raws.unquoted)
          : getBooleanClassNameFor(attribute);
        const replacementNode = selectorParser.className({ value: className });
        node.replaceWith(replacementNode);
        didScopeNode = true;
      });

      if (!didScopeNode) {
        const className = getBaseClassName();
        const newNode = selectorParser.className({ value: className });
        // If they wrote `button {}`, then we want `button.scoped-class.name {}`
        // This is so they can set custom styling if they override tags
        // Note that is safe since we don't allow combinators.
        selector.append(newNode);
      }

      container.walkCombinators(() => {
        throw new Error('You cannot use combinators with cssta');
      });
    });
  };

  const root = postcss.parse(inputCss);

  transformAnimationNames({
    transform: (value) => {
      if (value in animationNameMap) return animationNameMap[value];

      const transformValue = generateAnimationName();
      animationNameMap[value] = transformValue;
      return transformValue;
    },
  }, root);

  const nodeTransformation = (node) => {
    switch (node.type) {
      case 'decl': {
        // Un-nest
        const selector = `.${getBaseClassName()}`;
        const prevNode = node.prev();
        if (prevNode && prevNode.type === 'rule' && prevNode.selector === selector) {
          prevNode.append(node);
          node.remove();
        } else {
          const ruleNode = postcss.rule({ selector });
          ruleNode.append(node);
          node.replaceWith(ruleNode);
        }
        break;
      } case 'rule': {
        // Transform [attribute=value] to class names
        node.selector = selectorParser(transformSelectors).process(node.selector).result;
        break;
      } case 'atrule': {
        if (!/keyframes$/i.test(node.name)) iterateSiblings(node, nodeTransformation);
        break;
      } default:
        break;
    }
  };

  iterateSiblings(root, nodeTransformation);

  const css = root.toString();

  return { css, baseClassName, classNameMap };
};

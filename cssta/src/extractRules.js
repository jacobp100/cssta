/* eslint-disable no-param-reassign */
const postcss = require('postcss');
const selectorParser = require('postcss-selector-parser');
const { transformAnimationNames } = require('postcss-transform-animations');


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
        const className = node.value
          ? getStringClassNameFor(node.attribute, node.raws.unquoted)
          : getBooleanClassNameFor(node.attribute);
        const replacementNode = selectorParser.className({ value: className });
        node.replaceWith(replacementNode);
        didScopeNode = true;
      });

      if (!didScopeNode) {
        const className = getBaseClassName();
        const newNode = selectorParser.className({ value: className });
        selector.prepend(newNode);
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

  root.nodes.forEach((node) => {
    switch (node.type) {
      case 'decl': {
        // Un-nest
        const ruleNode = postcss.rule({
          selector: `.${getBaseClassName()}`,
        });
        ruleNode.append(node);
        node.replaceWith(ruleNode);
        break;
      } case 'rule': {
        // Transform [attribute=value] to class names
        node.selector = selectorParser(transformSelectors).process(node.selector).result;
        break;
      } default:
        break;
    }
  });

  const css = root.toString();

  return { css, baseClassName, classNameMap };
};

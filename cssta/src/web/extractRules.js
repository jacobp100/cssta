/* eslint-disable no-param-reassign */
const selectorParser = require('postcss-selector-parser');
const { transformAnimationNames } = require('postcss-transform-animations');
const getRoot = require('../util/getRoot');
const { isDirectChildOfKeyframes } = require('../util');


module.exports = (inputCss, { generateClassName, generateAnimationName }) => {
  const classNameMap = {}; // { propName: { propValue: className } }
  const animationNameMap = {};

  let baseClassName = null;
  const getBaseClassName = () => {
    if (!baseClassName) baseClassName = generateClassName();
    return baseClassName;
  };

  const getClassNameFor = (attribute, value) => {
    if (!classNameMap[attribute]) {
      classNameMap[attribute] = {};
    }

    if (!classNameMap[attribute][value]) {
      classNameMap[attribute][value] = generateClassName();
    }

    return classNameMap[attribute][value];
  };

  const transformSelectors = selectorParser((container) => {
    container.each((selector) => {
      container.walkNesting((node) => {
        const className = getBaseClassName();
        const replacementNode = selectorParser.className({ value: className });
        node.replaceWith(replacementNode);
      });

      selector.walkAttributes((node) => {
        const attribute = node.attribute.trim();
        const value = node.value ? node.raws.unquoted : 'true';
        const className = getClassNameFor(attribute, value);
        const replacementNode = selectorParser.className({ value: className });
        node.replaceWith(replacementNode);
      });
    });
  });

  const { root, propTypes } = getRoot(inputCss);

  transformAnimationNames({
    transform: (value) => {
      if (value in animationNameMap) return animationNameMap[value];

      const transformValue = generateAnimationName();
      animationNameMap[value] = transformValue;
      return transformValue;
    },
  }, root);

  root.walkRules((node) => {
    if (!isDirectChildOfKeyframes(node)) {
      node.selector = transformSelectors.process(node.selector).result;
    }
  });

  const css = root.toString();

  return { css, baseClassName, classNameMap, propTypes };
};

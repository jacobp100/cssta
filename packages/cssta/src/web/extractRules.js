// @flow
/* eslint-disable no-param-reassign */
const selectorParser = require('postcss-selector-parser');
const { transformAnimationNames } = require('postcss-transform-animations');
const getRoot = require('../util/getRoot');
const { isDirectChildOfKeyframes } = require('../util');
/*:: import type { Args } from './types' */

/*::
type Generators = {
  generateClassName: () => string,
  generateAnimationName: () => string,
}
*/

module.exports = (
  inputCss /*: string */,
  { generateClassName, generateAnimationName } /*: Generators */
) /*: { css: string, propTypes: Object, args: Args } */ => {
  const classNameMap = {}; // { propName: { propValue: className } }
  const animationNameMap = {};

  let defaultClassName = null;
  const getDefaultClassName = () => {
    if (!defaultClassName) defaultClassName = generateClassName();
    return defaultClassName;
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
        const className = getDefaultClassName();
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

  const { root, propTypes } = getRoot(inputCss, true);

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
  const args = { defaultClassName, classNameMap };

  return { css, propTypes, args };
};

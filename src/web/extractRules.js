// @flow
/* eslint-disable no-param-reassign */
const selectorParser = require("postcss-selector-parser");
const { transformAnimationNames } = require("postcss-transform-animations");
const getRoot = require("../util/getRoot");
const { isDirectChildOfKeyframes } = require("../util/cssAst");
/*:: import type { Args } from './types' */

/*::
type Generators = {
  generateClassName: (?string, ?string) => string,
  generateAnimationName: (string) => string,
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
    if (defaultClassName === null) defaultClassName = generateClassName();
    return defaultClassName;
  };

  const getClassNameFor = (prop, value) => {
    if (!classNameMap[prop]) {
      classNameMap[prop] = {};
    }

    if (!classNameMap[prop][value]) {
      classNameMap[prop][value] = generateClassName(
        prop,
        value !== "true" ? value : null
      );
    }

    return classNameMap[prop][value];
  };

  const transformSelectors = selectorParser(container => {
    container.each(selector => {
      container.walkNesting(node => {
        const className = getDefaultClassName();
        const replacementNode = selectorParser.className({ value: className });
        node.replaceWith(replacementNode);
      });

      selector.walkAttributes(node => {
        const attribute = node.attribute.trim();
        if (attribute[0] !== "*") return;
        const prop = attribute.slice(1);
        const value = node.value ? node.raws.unquoted : "true";
        const className = getClassNameFor(prop, value);
        const replacementNode = selectorParser.className({ value: className });
        node.replaceWith(replacementNode);
      });
    });
  });

  const { root, propTypes } = getRoot(inputCss, true);

  root.walkRules(node => {
    if (!isDirectChildOfKeyframes(node)) {
      node.selector = transformSelectors.process(node.selector).result;
    }
  });

  transformAnimationNames(
    {
      transform: value => {
        if (value in animationNameMap) return animationNameMap[value];

        const transformValue = generateAnimationName(value);
        animationNameMap[value] = transformValue;
        return transformValue;
      }
    },
    root
  );

  const css = root.toString();
  const args = { defaultClassName, classNameMap };

  return { css, propTypes, args };
};

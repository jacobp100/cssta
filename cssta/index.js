/* global document */
const postcss = require('postcss');
const selectorParser = require('postcss-selector-parser');

let devId = 0;
const getDevId = () => {
  devId += 1;
  return `css-${devId}`;
};

const createCssElement = (cssText) => {
  const styleElement = document.createElement('style');
  const styleBody = document.createTextNode(cssText);
  styleElement.appendChild(styleBody);
  document.getElementsByTagName('head')[0].appendChild(styleElement);
};

/* eslint-disable no-param-reassign */
const transformClassNames = (css, transformClassName) => {
  const classNameMap = {};

  const transformClassNode = (classNode) => {
    const { value } = classNode;

    if (value in classNameMap) {
      classNode.value = classNameMap[value];
    } else {
      const transformValue = transformClassName(value);
      classNameMap[value] = transformValue;
      classNode.value = transformValue;
    }
  };

  const transformSelector = selector => selectorParser((node) => {
    node.walkClasses(transformClassNode);
  }).process(selector).result;

  const root = postcss.parse(css);

  root.walkRules((rule) => {
    rule.selectors = rule.selectors.map(transformSelector);
  });

  const output = root.toString();

  return { output, classNameMap };
};
/* eslint-enable */

module.exports = (css, prefix = getDevId()) => {
  const { output, classNameMap } = transformClassNames(css, className => (
    `${prefix}__${className}`
  ));
  createCssElement(output);
  return classNameMap;
};
module.exports.transformClassNames = transformClassNames;

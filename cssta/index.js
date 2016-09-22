/* global document */
const postcss = require('postcss');
const selectorParser = require('postcss-selector-parser');
const { transformClassNames } = require('postcss-transform-classes');

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

const transformClassNames = (css, transformClassName) => {
  const classNameMap = {};

  const root = postcss.parse(css);

  transformClassNames({
    transform: value => {
      if (value in classNameMap) return classNameMap[value];

      const transformValue = transformClassName(value);
      classNameMap[value] = transformValue;
      return transformValue;
    }
  }, root);

  const output = root.toString();

  return { output, classNameMap };
};

module.exports = (css, prefix = getDevId()) => {
  const { output, classNameMap } = transformClassNames(css, className => (
    `${prefix}__${className}`
  ));
  createCssElement(output);
  return classNameMap;
};
module.exports.transformClassNames = transformClassNames;

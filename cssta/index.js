/* global document */
const postcss = require('postcss');
const { transformClassNames } = require('postcss-transform-classes');
const { transformAnimationNames } = require('postcss-transform-animations');

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

const transform = (css, {
  transformClassName,
  transformAnimationName,
}) => {
  const classNameMap = {};
  const animationNameMap = {};

  const root = postcss.parse(css);

  transformClassNames({
    transform: (value) => {
      if (value in classNameMap) return classNameMap[value];

      const transformValue = transformClassName(value);
      classNameMap[value] = transformValue;
      return transformValue;
    },
  }, root);

  transformAnimationNames({
    transform: (value) => {
      if (value in animationNameMap) return animationNameMap[value];

      const transformValue = transformAnimationName(value);
      animationNameMap[value] = transformValue;
      return transformValue;
    },
  }, root);

  const output = root.toString();

  return { output, classNameMap, animationNameMap };
};

module.exports = (css, prefix = getDevId()) => {
  const { output, classNameMap } = transform(css, {
    transformClassName: className => `${prefix}__${className}`,
    transformAnimationName: animationName => `${prefix}__${animationName}`,
  });
  createCssElement(output);
  return classNameMap;
};
module.exports.transform = transform;

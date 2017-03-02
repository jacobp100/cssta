'use strict';

/* eslint-disable no-param-reassign */
var selectorParser = require('postcss-selector-parser');

var _require = require('postcss-transform-animations'),
    transformAnimationNames = _require.transformAnimationNames;

var getRoot = require('../util/getRoot');

var _require2 = require('../util'),
    isDirectChildOfKeyframes = _require2.isDirectChildOfKeyframes;

module.exports = function (inputCss, _ref) {
  var generateClassName = _ref.generateClassName,
      generateAnimationName = _ref.generateAnimationName;

  var classNameMap = {}; // { propName: { propValue: className } }
  var animationNameMap = {};

  var baseClassName = null;
  var getBaseClassName = function getBaseClassName() {
    if (!baseClassName) baseClassName = generateClassName();
    return baseClassName;
  };

  var getClassNameFor = function getClassNameFor(attribute, value) {
    if (!classNameMap[attribute]) {
      classNameMap[attribute] = {};
    }

    if (!classNameMap[attribute][value]) {
      classNameMap[attribute][value] = generateClassName();
    }

    return classNameMap[attribute][value];
  };

  var transformSelectors = selectorParser(function (container) {
    container.each(function (selector) {
      container.walkNesting(function (node) {
        var className = getBaseClassName();
        var replacementNode = selectorParser.className({ value: className });
        node.replaceWith(replacementNode);
      });

      selector.walkAttributes(function (node) {
        var attribute = node.attribute.trim();
        var value = node.value ? node.raws.unquoted : 'true';
        var className = getClassNameFor(attribute, value);
        var replacementNode = selectorParser.className({ value: className });
        node.replaceWith(replacementNode);
      });
    });
  });

  var _getRoot = getRoot(inputCss, true),
      root = _getRoot.root,
      propTypes = _getRoot.propTypes;

  transformAnimationNames({
    transform: function transform(value) {
      if (value in animationNameMap) return animationNameMap[value];

      var transformValue = generateAnimationName();
      animationNameMap[value] = transformValue;
      return transformValue;
    }
  }, root);

  root.walkRules(function (node) {
    if (!isDirectChildOfKeyframes(node)) {
      node.selector = transformSelectors.process(node.selector).result;
    }
  });

  var css = root.toString();

  return { css: css, propTypes: propTypes, baseClassName: baseClassName, classNameMap: classNameMap };
};
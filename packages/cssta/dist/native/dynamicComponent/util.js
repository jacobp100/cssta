'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

/* eslint-disable */
var _require = require('react-native'),
    StyleSheet = _require.StyleSheet;
/* eslint-enable */
/* eslint-disable no-param-reassign */


var cssToReactNative = require('css-to-react-native').default;
var transformVariables = require('../../css-transforms/variables');
var transformColors = require('../../css-transforms/colors');

/*
type Rule = {
  validate: Props => boolean,
  styleTuples: ([StyleProperty, string])[],
  exportedVariables: { [key:StyleVariableName]: string },
};
*/

/*
UntransformedStyles
  * Empty from variables manager
  * `rules` from any other config

TransformedStyles
  * Stylesheet from variables manager
  * Animated from transition manager
  * Also user styles
*/

module.exports.createRuleStylesUsingStylesheet = function (appliedVariables, untransformedRules) {
  var styles = untransformedRules.map(function (rule) {
    var styleTuples = rule.styleTuples.map(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          property = _ref2[0],
          value = _ref2[1];

      var transformedValue = value;
      transformedValue = transformVariables(transformedValue, appliedVariables);
      transformedValue = transformColors(transformedValue);
      return [property, transformedValue];
    });
    return cssToReactNative(styleTuples);
  });

  var styleBody = styles.reduce(function (accum, style, index) {
    accum[index] = style;
    return accum;
  }, {});
  var stylesheet = StyleSheet.create(styleBody);

  var rules = untransformedRules.map(function (rule, index) {
    return Object.assign({}, rule, { style: styles[index], styleSheetReference: stylesheet[index] });
  });

  return rules;
};
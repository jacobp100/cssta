'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var React = require('react');
/* eslint-disable */

var _require = require('react-native'),
    StyleSheet = _require.StyleSheet;
/* eslint-enable */


var cssToReactNative = require('css-to-react-native').default;
var VariablesProvider = require('../VariablesProvider');
var transformVariables = require('../../css-transforms/variables');
var transformColors = require('../../css-transforms/colors');

var _require2 = require('../util'),
    getAppliedRules = _require2.getAppliedRules;

var resolveVariableDependencies = require('../../util/resolveVariableDependencies');

var Component = React.Component;

/* eslint-disable no-param-reassign */

var getExportedVariables = function getExportedVariables(props, variablesFromScope) {
  var appliedRuleVariables = getAppliedRules(props.args.rules, props.ownProps).map(function (rule) {
    return rule.exportedVariables;
  });
  var definedVariables = Object.assign.apply(Object, [{}].concat(_toConsumableArray(appliedRuleVariables)));
  return resolveVariableDependencies(definedVariables, variablesFromScope);
};

var transformStyleTuples = function transformStyleTuples(appliedVariables, styleTuples) {
  var transformedStyleTuples = styleTuples.map(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        property = _ref2[0],
        value = _ref2[1];

    var transformedValue = value;
    transformedValue = transformVariables(transformedValue, appliedVariables);
    transformedValue = transformColors(transformedValue);
    return [property, transformedValue];
  });
  return cssToReactNative(transformedStyleTuples);
};

var createRuleStylesUsingStylesheet = function createRuleStylesUsingStylesheet(appliedVariables, args) {
  var styles = args.rules.map(function (rule) {
    return transformStyleTuples(appliedVariables, rule.styleTuples);
  });

  var styleBody = styles.reduce(function (accum, style, index) {
    accum[index] = style;
    return accum;
  }, {});
  var stylesheet = StyleSheet.create(styleBody);

  var rules = args.rules.map(function (rule, index) {
    return Object.assign({}, rule, { style: stylesheet[index] });
  });

  // FIXME: Transitions (i.e. `transition: color var(--short-duration) var(--easing)`)
  var keyframesStyleTuples = args.keyframesStyleTuples;

  var keyframes = Object.keys(keyframesStyleTuples).reduce(function (accum, keyframeName) {
    var keyframeStyles = keyframesStyleTuples[keyframeName].map(function (_ref3) {
      var time = _ref3.time,
          styleTuples = _ref3.styleTuples;
      return {
        time: time,
        styles: transformStyleTuples(appliedVariables, styleTuples)
      };
    });
    accum[keyframeName] = keyframeStyles;
    return accum;
  }, {});

  return { rules: rules, keyframes: keyframes };
};

module.exports = function (_Component) {
  _inherits(VariablesStyleSheetManager, _Component);

  function VariablesStyleSheetManager() {
    _classCallCheck(this, VariablesStyleSheetManager);

    var _this = _possibleConstructorReturn(this, (VariablesStyleSheetManager.__proto__ || Object.getPrototypeOf(VariablesStyleSheetManager)).call(this));

    _this.styleCache = {};

    _this.getExportedVariables = function (variablesFromScope) {
      return getExportedVariables(_this.props, variablesFromScope);
    };
    _this.renderWithVariables = _this.renderWithVariables.bind(_this);
    return _this;
  }

  _createClass(VariablesStyleSheetManager, [{
    key: 'renderWithVariables',
    value: function renderWithVariables(appliedVariables) {
      var styleCache = this.styleCache;


      var ownAppliedVariables = this.props.args.importedVariables.reduce(function (accum, key) {
        accum[key] = appliedVariables[key];
        return accum;
      }, {});
      var styleCacheKey = JSON.stringify(ownAppliedVariables);
      var styleCached = styleCacheKey in styleCache;

      var transformedArgs = styleCached ? styleCache[styleCacheKey] : createRuleStylesUsingStylesheet(ownAppliedVariables, this.props.args);

      if (!styleCached) styleCache[styleCacheKey] = transformedArgs;

      var _props = this.props,
          args = _props.args,
          children = _props.children;

      var nextArgs = Object.assign({}, args, transformedArgs);
      var nextProps = Object.assign({}, this.props, { args: nextArgs });

      return children(nextProps);
    }
  }, {
    key: 'render',
    value: function render() {
      return React.createElement(VariablesProvider, { exportedVariables: this.getExportedVariables }, this.renderWithVariables);
    }
  }]);

  return VariablesStyleSheetManager;
}(Component);
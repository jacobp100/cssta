'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/* eslint-disable no-param-reassign */
var React = require('react');

var _require = require('./util'),
    createRuleStylesUsingStylesheet = _require.createRuleStylesUsingStylesheet;

var VariablesProvider = require('../VariablesProvider');
var resolveVariableDependencies = require('../../util/resolveVariableDependencies');

var Component = React.Component;


var getExportedVariables = function getExportedVariables(ownProps, variablesFromScope, rules) {
  var appliedRuleVariables = rules.filter(function (rule) {
    return rule.validate(ownProps);
  }).map(function (rule) {
    return rule.exportedVariables;
  });
  var definedVariables = Object.assign.apply(Object, [{}].concat(_toConsumableArray(appliedRuleVariables)));
  return resolveVariableDependencies(definedVariables, variablesFromScope);
};

module.exports = function (_Component) {
  _inherits(VariablesStyleSheetManager, _Component);

  function VariablesStyleSheetManager() {
    _classCallCheck(this, VariablesStyleSheetManager);

    var _this = _possibleConstructorReturn(this, (VariablesStyleSheetManager.__proto__ || Object.getPrototypeOf(VariablesStyleSheetManager)).call(this));

    _this.styleCache = {};
    return _this;
  }

  _createClass(VariablesStyleSheetManager, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          NextElement = _props.NextElement,
          Element = _props.Element,
          ownProps = _props.ownProps,
          passedProps = _props.passedProps,
          untransformedRules = _props.rules,
          managerArgs = _props.managerArgs;
      var importedVariables = managerArgs.importedVariables;
      var styleCache = this.styleCache;


      return React.createElement(VariablesProvider, {
        exportedVariables: function exportedVariables(variablesFromScope) {
          return getExportedVariables(ownProps, variablesFromScope, untransformedRules);
        }
      }, function (appliedVariables) {
        var ownAppliedVariables = importedVariables.reduce(function (accum, key) {
          accum[key] = appliedVariables[key];
          return accum;
        }, {});
        var styleCacheKey = JSON.stringify(ownAppliedVariables);
        var styleCached = styleCacheKey in styleCache;

        var rules = styleCached ? styleCache[styleCacheKey] : createRuleStylesUsingStylesheet(ownAppliedVariables, untransformedRules);

        if (!styleCached) styleCache[styleCacheKey] = rules;

        var nextProps = { Element: Element, ownProps: ownProps, passedProps: passedProps, rules: rules, managerArgs: managerArgs };
        return React.createElement(NextElement, nextProps);
      });
    }
  }]);

  return VariablesStyleSheetManager;
}(Component);
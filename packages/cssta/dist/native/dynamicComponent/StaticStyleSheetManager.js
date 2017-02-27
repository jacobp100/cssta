'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/* eslint-disable no-param-reassign */
var React = require('react');

var _require = require('./util'),
    createRuleStylesUsingStylesheet = _require.createRuleStylesUsingStylesheet;

var Component = React.Component;


module.exports = function (_Component) {
  _inherits(StaticStyleSheetManager, _Component);

  function StaticStyleSheetManager(props) {
    _classCallCheck(this, StaticStyleSheetManager);

    var _this = _possibleConstructorReturn(this, (StaticStyleSheetManager.__proto__ || Object.getPrototypeOf(StaticStyleSheetManager)).call(this));

    _this.rules = createRuleStylesUsingStylesheet({}, props.rules);
    return _this;
  }

  _createClass(StaticStyleSheetManager, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          Element = _props.Element,
          ownProps = _props.ownProps,
          passedProps = _props.passedProps,
          managerArgs = _props.managerArgs;
      var rules = this.rules;


      var nextProps = { Element: Element, ownProps: ownProps, passedProps: passedProps, rules: rules, managerArgs: managerArgs };
      return React.createElement(Element, nextProps);
    }
  }]);

  return StaticStyleSheetManager;
}(Component);
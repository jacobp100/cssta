'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/* eslint-disable no-param-reassign */
var React = require('react');

var _require = require('events'),
    EventEmitter = _require.EventEmitter;

var _require2 = require('../util'),
    shallowEqual = _require2.shallowEqual;

var Component = React.Component,
    Children = React.Children,
    PropTypes = React.PropTypes;


var STYLES_UPDATED = 'styles-updated';

var getStyles = function getStyles() {
  var variablesFromScope = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var inputExportedVariables = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var exportedVariables = typeof inputExportedVariables === 'function' ? inputExportedVariables(variablesFromScope) : inputExportedVariables;

  var appliedVariables = Object.assign({}, variablesFromScope, exportedVariables);

  return { variablesFromScope: variablesFromScope, appliedVariables: appliedVariables };
};

var VariablesProvider = function (_Component) {
  _inherits(VariablesProvider, _Component);

  function VariablesProvider(props, context) {
    _classCallCheck(this, VariablesProvider);

    var _this = _possibleConstructorReturn(this, (VariablesProvider.__proto__ || Object.getPrototypeOf(VariablesProvider)).call(this));

    _this.state = getStyles(context.csstaInitialVariables || {}, props.exportedVariables);

    _this.styleEmitter = new EventEmitter();
    _this.styleUpdateHandler = function (variablesFromScope) {
      _this.updateState(variablesFromScope, _this.props.exportedVariables);
    };

    _this.updateState = function (variablesFromScope, exportedVariables) {
      var nextState = getStyles(variablesFromScope, exportedVariables);

      if (!shallowEqual(_this.state.variablesFromScope, nextState.variablesFromScope) || !shallowEqual(_this.state.appliedVariables, nextState.appliedVariables)) {
        _this.setState(nextState);
        _this.styleEmitter.emit(STYLES_UPDATED, nextState.appliedVariables);
      }
    };
    return _this;
  }

  _createClass(VariablesProvider, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return { cssta: this.styleEmitter, csstaInitialVariables: this.state.appliedVariables };
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      if (this.context.cssta) this.context.cssta.on(STYLES_UPDATED, this.styleUpdateHandler);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      var nextExportedVariablesChanged = _typeof(nextProps.exportedVariables) === 'object' ? !shallowEqual(this.props.exportedVariables, nextProps.exportedVariables) : true; // If it's a function, it might change

      if (nextExportedVariablesChanged) {
        this.updateState(this.state.variablesFromScope, nextProps.exportedVariables);
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (this.context.cssta) this.context.cssta.off(STYLES_UPDATED, this.styleUpdateHandler);
    }
  }, {
    key: 'render',
    value: function render() {
      var children = this.props.children;
      var appliedVariables = this.state.appliedVariables;

      return typeof children === 'function' ? children(appliedVariables) : Children.only(children);
    }
  }]);

  return VariablesProvider;
}(Component);

VariablesProvider.contextTypes = {
  cssta: PropTypes.object,
  csstaInitialVariables: PropTypes.object
};

VariablesProvider.childContextTypes = VariablesProvider.contextTypes;

VariablesProvider.propTypes = {
  exportedVariables: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.element])
};

module.exports = VariablesProvider;
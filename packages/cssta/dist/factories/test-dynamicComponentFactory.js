'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/* global jest it, expect */
var React = require('react');
var renderer = require('react-test-renderer'); // eslint-disable-line
var dynamicComponentFactory = require('../dynamicComponentFactory');
// FIXME: Test VariablesProvider separately
var VariablesProvider = require('../../native/VariablesProvider');

var assignStyle = function assignStyle(ownProps, passedProps, style) {
  return Object.assign({}, passedProps, { style: style });
};

var runTest = function runTest() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$getExportedVaria = _ref.getExportedVariables,
      getExportedVariables = _ref$getExportedVaria === undefined ? function () {
    return {};
  } : _ref$getExportedVaria,
      _ref$generateStyleshe = _ref.generateStylesheet,
      generateStylesheet = _ref$generateStyleshe === undefined ? function (style) {
    return style;
  } : _ref$generateStyleshe,
      _ref$type = _ref.type,
      type = _ref$type === undefined ? 'button' : _ref$type,
      _ref$propTypes = _ref.propTypes,
      propTypes = _ref$propTypes === undefined ? [] : _ref$propTypes,
      _ref$importedVariable = _ref.importedVariables,
      importedVariables = _ref$importedVariable === undefined ? [] : _ref$importedVariable,
      _ref$inputProps = _ref.inputProps,
      inputProps = _ref$inputProps === undefined ? {} : _ref$inputProps,
      _ref$inputChildren = _ref.inputChildren,
      inputChildren = _ref$inputChildren === undefined ? [] : _ref$inputChildren,
      _ref$validProps = _ref.validProps,
      validProps = _ref$validProps === undefined ? [] : _ref$validProps,
      _ref$invalidProps = _ref.invalidProps,
      invalidProps = _ref$invalidProps === undefined ? [] : _ref$invalidProps,
      _ref$expectedType = _ref.expectedType,
      expectedType = _ref$expectedType === undefined ? type : _ref$expectedType,
      _ref$expectedProps = _ref.expectedProps,
      expectedProps = _ref$expectedProps === undefined ? {} : _ref$expectedProps,
      _ref$expectedChildren = _ref.expectedChildren,
      expectedChildren = _ref$expectedChildren === undefined ? null : _ref$expectedChildren;

  var createComponent = dynamicComponentFactory(VariablesProvider, getExportedVariables, generateStylesheet, function (ownProps, passedProps) {
    return passedProps;
  });
  var Element = createComponent(type, propTypes, importedVariables);

  var validator = Element.propTypes;
  Object.keys(inputProps).forEach(function (prop) {
    validProps.forEach(function (value) {
      validator(inputProps, prop, value);
    });

    invalidProps.forEach(function (value) {
      expect(function () {
        return validator(inputProps, prop, value);
      }).toThrow();
    });
  });

  var component = renderer.create(React.createElement.apply(React, [Element, inputProps].concat(_toConsumableArray(inputChildren)))).toJSON();

  expect(component.type).toEqual(expectedType);
  expect(component.props).toEqual(expectedProps);
  expect(component.children).toEqual(expectedChildren);
};

it('allows constructing with another component', function () {
  return runTest({
    type: 'span'
  });
});

it('allows overriding the component', function () {
  return runTest({
    inputProps: { component: 'span' },
    expectedType: 'span',
    expectedProps: {}
  });
});

it('adds boolean propTypes', function () {
  return runTest({
    propTypes: {
      booleanAttribute: { type: 'bool' }
    },
    validProps: [{ booleanAttribute: true }, { booleanAttribute: false }],
    invalidProps: [{ booleanAttribute: 5 }, { booleanAttribute: 'string' }, { booleanAttribute: function booleanAttribute() {} }]
  });
});

it('adds string propTypes', function () {
  return runTest({
    propTypes: {
      booleanAttribute: {
        type: 'oneOf',
        values: ['value1', 'value2']
      }
    },
    validProps: [{ stringAttribute: 'value1' }, { stringAttribute: 'value2' }],
    invalidProps: [{ stringAttribute: true }, { stringAttribute: false }, { stringAttribute: 5 }, { stringAttribute: 'other string' }, { stringAttribute: function stringAttribute() {} }]
  });
});

it('allows children', function () {
  return runTest({
    inputChildren: ['text'],
    expectedChildren: ['text']
  });
});

it('should use variables from a higher scope', function () {
  var generateStylesheet = jest.fn(function (style) {
    return style;
  });
  var createChildComponent = dynamicComponentFactory(VariablesProvider, function () {
    return {};
  }, generateStylesheet, assignStyle);
  var ChildElement = createChildComponent('div', {}, ['color']);

  runTest({
    getExportedVariables: function getExportedVariables() {
      return { color: 'red' };
    },
    inputChildren: [React.createElement(ChildElement, {})],
    expectedChildren: [{
      type: 'div',
      props: { style: { color: 'red' } },
      children: null
    }]
  });

  expect(generateStylesheet.mock.calls.length).toBe(1);
  expect(generateStylesheet.mock.calls[0][0]).toEqual({ color: 'red' });
});

it('should make own styles take precedence', function () {
  var generateStylesheet = jest.fn(function (style) {
    return style;
  });
  var createChildComponent = dynamicComponentFactory(VariablesProvider, function () {
    return { color: 'blue' };
  }, generateStylesheet, assignStyle);
  var ChildElement = createChildComponent('div', {}, ['color']);

  runTest({
    getExportedVariables: function getExportedVariables() {
      return { color: 'red' };
    },
    inputChildren: [React.createElement(ChildElement, {})],
    expectedChildren: [{
      type: 'div',
      props: { style: { color: 'blue' } },
      children: null
    }]
  });

  expect(generateStylesheet.mock.calls.length).toBe(1);
  expect(generateStylesheet.mock.calls[0][0]).toEqual({ color: 'blue' });
});

it('updates styles in reaction to prop changes', function () {
  var ParentElement = dynamicComponentFactory(VariablesProvider, function (ownProps) {
    return ownProps.blue ? { color: 'blue' } : { color: 'red' };
  }, function (style) {
    return style;
  }, function (ownProps, passedProps) {
    return passedProps;
  })('div', ['blue'], []);

  var ChildElement = dynamicComponentFactory(VariablesProvider, function () {
    return {};
  }, function (style) {
    return style;
  }, assignStyle)('div', {}, ['color']);

  var instance = renderer.create(React.createElement(ParentElement, {}, React.createElement(ChildElement, {})));

  expect(instance.toJSON().children[0].props.style).toEqual({ color: 'red' });

  instance.update(React.createElement(ParentElement, { blue: true }, React.createElement(ChildElement, {})));

  expect(instance.toJSON().children[0].props.style).toEqual({ color: 'blue' });
});

it('removes listener on unmounting', function () {
  var cssta = {
    on: function on() {},
    off: jest.fn()
  };

  var ProvidesContext = function (_React$Component) {
    _inherits(ProvidesContext, _React$Component);

    function ProvidesContext() {
      _classCallCheck(this, ProvidesContext);

      return _possibleConstructorReturn(this, (ProvidesContext.__proto__ || Object.getPrototypeOf(ProvidesContext)).apply(this, arguments));
    }

    _createClass(ProvidesContext, [{
      key: 'getChildContext',
      value: function getChildContext() {
        return { cssta: cssta, csstaInitialVariables: {} };
      } // eslint-disable-line

    }, {
      key: 'render',
      value: function render() {
        return this.props.children;
      }
    }]);

    return ProvidesContext;
  }(React.Component);

  ProvidesContext.contextTypes = {
    cssta: React.PropTypes.object,
    csstaInitialVariables: React.PropTypes.object
  };
  ProvidesContext.childContextTypes = ProvidesContext.contextTypes;

  var ChildElement = dynamicComponentFactory(VariablesProvider, function () {
    return {};
  }, function (style) {
    return style;
  }, assignStyle)('div', {}, []);

  var instance = renderer.create(React.createElement(ProvidesContext, {}, React.createElement(ChildElement, {})));

  expect(cssta.off.mock.calls.length).toBe(0);

  instance.unmount();

  expect(cssta.off.mock.calls.length).toBe(1);
});

it('reesets listener on when changing cssta context', function () {
  var cssta1 = { on: jest.fn(), off: jest.fn() };
  var cssta2 = { on: jest.fn(), off: jest.fn() };

  var ProvidesContext = function (_React$Component2) {
    _inherits(ProvidesContext, _React$Component2);

    function ProvidesContext() {
      _classCallCheck(this, ProvidesContext);

      return _possibleConstructorReturn(this, (ProvidesContext.__proto__ || Object.getPrototypeOf(ProvidesContext)).apply(this, arguments));
    }

    _createClass(ProvidesContext, [{
      key: 'getChildContext',
      value: function getChildContext() {
        return { cssta: this.props.cssta, csstaInitialVariables: {} };
      }
    }, {
      key: 'render',
      value: function render() {
        return this.props.children;
      }
    }]);

    return ProvidesContext;
  }(React.Component);

  ProvidesContext.contextTypes = {
    cssta: React.PropTypes.object,
    csstaInitialVariables: React.PropTypes.object
  };
  ProvidesContext.childContextTypes = ProvidesContext.contextTypes;

  var ChildElement = dynamicComponentFactory(VariablesProvider, function () {
    return {};
  }, function (style) {
    return style;
  }, assignStyle)('div', {}, []);

  var instance = renderer.create(React.createElement(ProvidesContext, { cssta: cssta1 }, React.createElement(ChildElement, {})));

  expect(cssta1.on.mock.calls.length).toBe(1);
  expect(cssta1.off.mock.calls.length).toBe(0);
  expect(cssta2.on.mock.calls.length).toBe(0);
  expect(cssta2.off.mock.calls.length).toBe(0);

  instance.update(React.createElement(ProvidesContext, { cssta: cssta2 }, React.createElement(ChildElement, {})));

  expect(cssta1.on.mock.calls.length).toBe(1);
  expect(cssta1.off.mock.calls.length).toBe(1);
  expect(cssta2.on.mock.calls.length).toBe(1);
  expect(cssta2.off.mock.calls.length).toBe(0);
});
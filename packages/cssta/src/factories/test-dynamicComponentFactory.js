/* global jest it, expect */
const React = require('react');
const renderer = require('react-test-renderer'); // eslint-disable-line
const dynamicComponentFactory = require('../dynamicComponentFactory');
// FIXME: Test VariablesProvider separately
const VariablesProvider = require('../../native/VariablesProvider');

const assignStyle = (ownProps, passedProps, style) => Object.assign({}, passedProps, { style });

const runTest = ({
  getExportedVariables = () => ({}),
  generateStylesheet = style => style,
  type = 'button',
  propTypes = [],
  importedVariables = [],
  inputProps = {},
  inputChildren = [],
  validProps = [],
  invalidProps = [],
  expectedType = type,
  expectedProps = {},
  expectedChildren = null,
} = {}) => {
  const createComponent = dynamicComponentFactory(
    VariablesProvider,
    getExportedVariables,
    generateStylesheet,
    (ownProps, passedProps) => passedProps
  );
  const Element = createComponent(type, propTypes, importedVariables);

  const validator = Element.propTypes;
  Object.keys(inputProps).forEach((prop) => {
    validProps.forEach((value) => {
      validator(inputProps, prop, value);
    });

    invalidProps.forEach((value) => {
      expect(() => validator(inputProps, prop, value)).toThrow();
    });
  });

  const component =
    renderer.create(React.createElement(Element, inputProps, ...inputChildren)).toJSON();

  expect(component.type).toEqual(expectedType);
  expect(component.props).toEqual(expectedProps);
  expect(component.children).toEqual(expectedChildren);
};

it('allows constructing with another component', () => runTest({
  type: 'span',
}));

it('allows overriding the component', () => runTest({
  inputProps: { component: 'span' },
  expectedType: 'span',
  expectedProps: {},
}));

it('adds boolean propTypes', () => runTest({
  propTypes: {
    booleanAttribute: { type: 'bool' },
  },
  validProps: [
    { booleanAttribute: true },
    { booleanAttribute: false },
  ],
  invalidProps: [
    { booleanAttribute: 5 },
    { booleanAttribute: 'string' },
    { booleanAttribute: () => {} },
  ],
}));

it('adds string propTypes', () => runTest({
  propTypes: {
    booleanAttribute: {
      type: 'oneOf',
      values: ['value1', 'value2'],
    },
  },
  validProps: [
    { stringAttribute: 'value1' },
    { stringAttribute: 'value2' },
  ],
  invalidProps: [
    { stringAttribute: true },
    { stringAttribute: false },
    { stringAttribute: 5 },
    { stringAttribute: 'other string' },
    { stringAttribute: () => {} },
  ],
}));

it('allows children', () => runTest({
  inputChildren: ['text'],
  expectedChildren: ['text'],
}));

it('should use variables from a higher scope', () => {
  const generateStylesheet = jest.fn(style => style);
  const createChildComponent = dynamicComponentFactory(
    VariablesProvider,
    () => ({}),
    generateStylesheet,
    assignStyle
  );
  const ChildElement = createChildComponent('div', {}, ['color']);

  runTest({
    getExportedVariables: () => ({ color: 'red' }),
    inputChildren: [React.createElement(ChildElement, {})],
    expectedChildren: [{
      type: 'div',
      props: { style: { color: 'red' } },
      children: null,
    }],
  });

  expect(generateStylesheet.mock.calls.length).toBe(1);
  expect(generateStylesheet.mock.calls[0][0]).toEqual({ color: 'red' });
});

it('should make own styles take precedence', () => {
  const generateStylesheet = jest.fn(style => style);
  const createChildComponent = dynamicComponentFactory(
    VariablesProvider,
    () => ({ color: 'blue' }),
    generateStylesheet,
    assignStyle
  );
  const ChildElement = createChildComponent('div', {}, ['color']);

  runTest({
    getExportedVariables: () => ({ color: 'red' }),
    inputChildren: [React.createElement(ChildElement, {})],
    expectedChildren: [{
      type: 'div',
      props: { style: { color: 'blue' } },
      children: null,
    }],
  });

  expect(generateStylesheet.mock.calls.length).toBe(1);
  expect(generateStylesheet.mock.calls[0][0]).toEqual({ color: 'blue' });
});

it('updates styles in reaction to prop changes', () => {
  const ParentElement = dynamicComponentFactory(
    VariablesProvider,
    ownProps => (ownProps.blue ? { color: 'blue' } : { color: 'red' }),
    style => style,
    (ownProps, passedProps) => passedProps
  )('div', ['blue'], []);

  const ChildElement = dynamicComponentFactory(
    VariablesProvider,
    () => ({}),
    style => style,
    assignStyle
  )('div', {}, ['color']);

  const instance = renderer.create(
    React.createElement(ParentElement, {},
      React.createElement(ChildElement, {})
    )
  );

  expect(instance.toJSON().children[0].props.style).toEqual({ color: 'red' });

  instance.update(
    React.createElement(ParentElement, { blue: true },
      React.createElement(ChildElement, {})
    )
  );

  expect(instance.toJSON().children[0].props.style).toEqual({ color: 'blue' });
});

it('removes listener on unmounting', () => {
  const cssta = {
    on: () => {},
    off: jest.fn(),
  };

  class ProvidesContext extends React.Component {
    getChildContext() { return { cssta, csstaInitialVariables: {} }; } // eslint-disable-line
    render() { return this.props.children; }
  }
  ProvidesContext.contextTypes = {
    cssta: React.PropTypes.object,
    csstaInitialVariables: React.PropTypes.object,
  };
  ProvidesContext.childContextTypes = ProvidesContext.contextTypes;

  const ChildElement = dynamicComponentFactory(
    VariablesProvider,
    () => ({}),
    style => style,
    assignStyle
  )('div', {}, []);

  const instance = renderer.create(
    React.createElement(ProvidesContext, {},
      React.createElement(ChildElement, {})
    )
  );

  expect(cssta.off.mock.calls.length).toBe(0);

  instance.unmount();

  expect(cssta.off.mock.calls.length).toBe(1);
});

it('reesets listener on when changing cssta context', () => {
  const cssta1 = { on: jest.fn(), off: jest.fn() };
  const cssta2 = { on: jest.fn(), off: jest.fn() };

  class ProvidesContext extends React.Component {
    getChildContext() { return { cssta: this.props.cssta, csstaInitialVariables: {} }; }
    render() { return this.props.children; }
  }
  ProvidesContext.contextTypes = {
    cssta: React.PropTypes.object,
    csstaInitialVariables: React.PropTypes.object,
  };
  ProvidesContext.childContextTypes = ProvidesContext.contextTypes;

  const ChildElement = dynamicComponentFactory(
    VariablesProvider,
    () => ({}),
    style => style,
    assignStyle
  )('div', {}, []);

  const instance = renderer.create(
    React.createElement(ProvidesContext, { cssta: cssta1 },
      React.createElement(ChildElement, {})
    )
  );

  expect(cssta1.on.mock.calls.length).toBe(1);
  expect(cssta1.off.mock.calls.length).toBe(0);
  expect(cssta2.on.mock.calls.length).toBe(0);
  expect(cssta2.off.mock.calls.length).toBe(0);

  instance.update(
    React.createElement(ProvidesContext, { cssta: cssta2 },
      React.createElement(ChildElement, {})
    )
  );

  expect(cssta1.on.mock.calls.length).toBe(1);
  expect(cssta1.off.mock.calls.length).toBe(1);
  expect(cssta2.on.mock.calls.length).toBe(1);
  expect(cssta2.off.mock.calls.length).toBe(0);
});

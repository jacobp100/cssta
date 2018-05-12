const React = require("react");
const renderer = require("react-test-renderer"); // eslint-disable-line
const createComponent = require("../createComponent");

const runTest = ({
  type = "button",
  propTypes = [],
  rules = [],
  inputProps = {},
  expectedType = type,
  expectedProps = {},
  expectedChildren = null
} = {}) => {
  const Element = createComponent(type, propTypes, { rules });

  const component = renderer
    .create(React.createElement(Element, inputProps))
    .toJSON();

  expect(component.type).toEqual(expectedType);
  expect(component.props).toEqual(expectedProps);
  expect(component.children).toEqual(expectedChildren);
};

it("renders an element", () => runTest());

it("validates rules", () =>
  runTest({
    rules: [
      {
        validate: () => true,
        style: 0
      }
    ],
    expectedProps: { style: 0 }
  }));

it("returns an array of styles if multiple match", () =>
  runTest({
    rules: [
      {
        validate: () => true,
        style: 0
      },
      {
        validate: () => true,
        style: 1
      }
    ],
    expectedProps: { style: [0, 1] }
  }));

it("adds a boolean property if it is equal to the expected value", () =>
  runTest({
    propTypes: ["booleanAttribute"],
    rules: [
      {
        validate: p => !!p.booleanAttribute,
        style: 0
      }
    ],
    inputProps: { booleanAttribute: true },
    expectedProps: { style: 0 }
  }));

it("does not add a boolean property if it is not equal to the expected value", () =>
  runTest({
    propTypes: ["booleanAttribute"],
    rules: [
      {
        validate: p => !!p.booleanAttribute,
        style: 0
      }
    ]
  }));

it("adds a string property if it is equal to the expected value", () =>
  runTest({
    propTypes: ["stringAttribute"],
    rules: [
      {
        validate: p => p.stringAttribute === "test",
        style: 0
      }
    ],
    inputProps: { stringAttribute: "test" },
    expectedProps: { style: 0 }
  }));

it("does not add a string property if it is not equal to the expected value", () =>
  runTest({
    propTypes: ["stringAttribute"],
    rules: [
      {
        validate: p => p.stringAttribute === "test",
        style: 0
      }
    ]
  }));

it("does not pass own props down", () =>
  runTest({
    propTypes: ["style"],
    inputProps: { style: "fancy" },
    expectedProps: {}
  }));

it("passes passed props down", () =>
  runTest({
    inputProps: { scrollingEnabled: false },
    expectedProps: { scrollingEnabled: false }
  }));

it("validates rules using own props", () =>
  runTest({
    propTypes: ["style"],
    rules: [
      {
        validate: p => p.style === "fancy",
        style: 0
      }
    ],
    inputProps: { style: "fancy" },
    expectedProps: { style: 0 }
  }));

it("does not validate invalid rules", () =>
  runTest({
    propTypes: ["style"],
    rules: [
      {
        validate: p => p.style === "fancy",
        style: 0
      }
    ],
    inputProps: { style: "dull and boring" },
    expectedProps: {}
  }));

it("passes down passed props as well as using own props", () =>
  runTest({
    rules: [
      {
        validate: () => true,
        style: 0
      }
    ],
    inputProps: { scrollingEnabled: false },
    expectedProps: { scrollingEnabled: false, style: 0 }
  }));

it("allows adding a style", () =>
  runTest({
    inputProps: { style: 0 },
    expectedProps: { style: 0 }
  }));

it("allows extending a style with a style array", () =>
  runTest({
    rules: [
      {
        validate: () => true,
        style: 0
      }
    ],
    inputProps: { style: [1] },
    expectedProps: { style: [0, 1] }
  }));

it("allows extending a style with a single value", () =>
  runTest({
    rules: [
      {
        validate: () => true,
        style: 0
      }
    ],
    inputProps: { style: 1 },
    expectedProps: { style: [0, 1] }
  }));

it("allows extending a style with an object", () =>
  runTest({
    rules: [
      {
        validate: () => true,
        style: 0
      }
    ],
    inputProps: { style: { color: "red" } },
    expectedProps: { style: [0, { color: "red" }] }
  }));

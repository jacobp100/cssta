const React = require("react");
const renderer = require("react-test-renderer"); // eslint-disable-line
const cssta = require("..");

const runTest = csstaFactory => {
  const Element = csstaFactory();

  const component = renderer.create(React.createElement(Element, {})).toJSON();

  expect(component.props.style).toEqual([{ color: "red" }]);
  expect(component.children).toEqual(null);
};

test("creates a component", () =>
  runTest(
    () =>
      cssta("dummy")`
        color: red;
      `
  ));

test("allows value interpolation", () =>
  runTest(() => {
    const color = "red";
    return cssta("dummy")`
    color: ${color};
  `;
  }));

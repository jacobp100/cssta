const React = require("react");
const renderer = require("react-test-renderer"); // eslint-disable-line
const VariablesProvider = require("../VariablesProvider");

const ReturnsVariables = () =>
  React.createElement(VariablesProvider, null, variables =>
    React.createElement("dummy", variables)
  );

it("should render children", () => {
  const component = renderer
    .create(
      React.createElement(
        VariablesProvider,
        { exportedVariables: { color: "red" } },
        ReturnsVariables
      )
    )
    .toJSON();

  expect(component.props).toEqual({ color: "red" });
});

it("should update variables", () => {
  const instance = renderer.create(
    React.createElement(
      VariablesProvider,
      { exportedVariables: { color: "red" } },
      React.createElement(ReturnsVariables)
    )
  );
  instance.update(
    React.createElement(
      VariablesProvider,
      { exportedVariables: { color: "green" } },
      React.createElement(ReturnsVariables)
    )
  );
  const component = instance.toJSON();

  expect(component.props).toEqual({ color: "green" });
});

it("sets variables from function", () => {
  const component = renderer
    .create(
      React.createElement(
        VariablesProvider,
        { exportedVariables: () => ({ color: "red" }) },
        React.createElement(ReturnsVariables)
      )
    )
    .toJSON();

  expect(component.props).toEqual({ color: "red" });
});

it("sets variables using scope from function", () => {
  const component = renderer
    .create(
      React.createElement(
        VariablesProvider,
        { exportedVariables: () => ({ primary: "red" }) },
        React.createElement(
          VariablesProvider,
          { exportedVariables: scope => ({ color: scope.primary }) },
          React.createElement(ReturnsVariables)
        )
      )
    )
    .toJSON();

  expect(component.props).toEqual({ primary: "red", color: "red" });
});

it("updates variables using scope from function", () => {
  const inner = React.createElement(
    VariablesProvider,
    { exportedVariables: scope => ({ color: scope.primary }) },
    React.createElement(ReturnsVariables)
  );

  const instance = renderer.create(
    React.createElement(
      VariablesProvider,
      { exportedVariables: { primary: "red" } },
      inner
    )
  );

  instance.update(
    React.createElement(
      VariablesProvider,
      { exportedVariables: { primary: "green" } },
      inner
    )
  );
  const component = instance.toJSON();

  expect(component.props).toEqual({ primary: "green", color: "green" });
});

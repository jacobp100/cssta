/* eslint-disable flowtype/require-valid-file-annotation */
/* global it, expect */
const React = require("react");
const PropTypes = require("prop-types");
const renderer = require("react-test-renderer"); // eslint-disable-line
const VariablesProvider = require("../VariablesProvider");

class ReturnsVariables extends React.Component {
  constructor(props, context) {
    super();
    this.state = { variables: context.csstaInitialVariables };
    this.styleUpdater = variables => {
      this.setState({ variables });
    };
  }

  componentDidMount() {
    this.context.cssta.on("styles-updated", this.styleUpdater);
  }

  componentWillUnmount() {
    this.context.cssta.off("styles-updated", this.styleUpdater);
  }

  render() {
    return React.createElement("dummy", this.state.variables);
  }
}
ReturnsVariables.contextTypes = {
  cssta: PropTypes.object,
  csstaInitialVariables: PropTypes.object
};

it("should generate context", () => {
  const component = renderer
    .create(
      React.createElement(
        VariablesProvider,
        { exportedVariables: { color: "red" } },
        React.createElement(ReturnsVariables)
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

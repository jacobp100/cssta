const React = require("react");
const VariablesContext = require("./VariablesContext");
const resolveVariableDependencies = require("./resolveVariableDependencies");

module.exports = (exportedCustomProperties, bloom) => {
  let scope = React.useContext(VariablesContext, bloom);

  if (exportedCustomProperties != null) {
    scope = resolveVariableDependencies(scope, exportedCustomProperties);
  }

  return scope;
};

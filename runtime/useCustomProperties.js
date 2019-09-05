// @flow
const React = require("react");
const VariablesContext = require("./VariablesContext");
const resolveVariableDependencies = require("./resolveVariableDependencies");

/*::
import type { Variables } from "./VariablesContext";
*/

module.exports = (
  exportedCustomProperties /*: ?Variables */
  // bloom /*: ?number */
) /*: Variables */ => {
  // let scope = React.useContext(VariablesContext, bloom);
  let scope = React.useContext(VariablesContext);

  if (exportedCustomProperties != null) {
    scope = resolveVariableDependencies(scope, exportedCustomProperties);
  }

  return scope;
};

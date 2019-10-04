import { useContext } from "react";
import VariablesContext from "./VariablesContext";
import resolveVariableDependencies from "./resolveVariableDependencies";
import { Variables } from "./VariablesContext";

export default (
  exportedCustomProperties?: Variables
  // bloom?: number
): Variables => {
  // let scope = React.useContext(VariablesContext, bloom);
  let scope = useContext(VariablesContext);

  if (exportedCustomProperties != null) {
    scope = resolveVariableDependencies(scope, exportedCustomProperties);
  }

  return scope;
};

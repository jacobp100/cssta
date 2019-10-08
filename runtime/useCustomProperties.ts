import { useContext, useMemo } from "react";
import VariablesContext from "./VariablesContext";
import resolveVariableDependencies from "./resolveVariableDependencies";
import { Variables } from "./VariablesContext";

export default (
  exportedCustomProperties?: Variables
  // bloom?: number
): Variables => {
  // let scope = React.useContext(VariablesContext, bloom);
  const inputScope = useContext(VariablesContext);

  const outputScope = useMemo(() => {
    return exportedCustomProperties != null
      ? resolveVariableDependencies(inputScope, exportedCustomProperties)
      : inputScope;
  }, [inputScope, exportedCustomProperties]);

  return outputScope;
};

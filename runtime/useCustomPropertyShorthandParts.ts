import { useMemo } from "react";
import variables from "./css-transforms/variables";
import { Variables } from "./VariablesContext";

export default (
  unresolvedShorthandParts: Record<string, string>[],
  customProperties: Variables
): Record<string, string>[] => {
  return useMemo(() => {
    return unresolvedShorthandParts.map(part => {
      const accum = {};
      Object.keys(part).forEach(key => {
        accum[key] = variables(part[key], customProperties);
      });
      return accum;
    });
  }, [unresolvedShorthandParts, customProperties]);
};

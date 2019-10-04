import { useMemo } from "react";
import { transformStyleTuples } from "./cssUtil";
import { StyleTuple } from "./cssUtil";
import { Variables } from "./VariablesContext";

export default (
  unresolvedStyleTuples: StyleTuple[],
  customProperties: Variables
): any => {
  return useMemo(
    () => transformStyleTuples(unresolvedStyleTuples, customProperties),
    [unresolvedStyleTuples, customProperties]
  );
};

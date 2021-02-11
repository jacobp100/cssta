import { useMemo } from "react";
import useWindowDimensions from "./useWindowDimensions";
import transformViewport from "./css-transforms/viewport";
import { StyleTuple } from "./cssUtil";

export default (unresolvedStyleTuples: StyleTuple[]): StyleTuple[] => {
  const windowDimensions = useWindowDimensions();

  return useMemo(() => {
    return unresolvedStyleTuples.map(([prop, value]) => [
      prop,
      transformViewport(value, windowDimensions),
    ]);
  }, [unresolvedStyleTuples, windowDimensions]);
};

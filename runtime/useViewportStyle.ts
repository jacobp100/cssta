import { useMemo } from "react";
import transformViewport from "./css-transforms/viewport";
import useWindowDimensions from "./useWindowDimensions";
import { transformStyleTuples } from "./cssUtil";
import { StyleTuple, Style } from "./cssUtil";

export default (unresolvedStyleTuples: StyleTuple[]): Style => {
  const windowDimensions = useWindowDimensions();

  return useMemo(() => {
    const styleTuples: StyleTuple[] = unresolvedStyleTuples.map(
      ([prop, value]) => [prop, transformViewport(value, windowDimensions)]
    );
    return transformStyleTuples(styleTuples);
  }, [unresolvedStyleTuples, windowDimensions]);
};

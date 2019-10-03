// @flow
/*
CAUTION!

This file could be included even after running the babel plugin.

Make sure you don't import large libraries.
*/
const React = require("react");
const transformViewport = require("./css-transforms/viewport");
const useWindowDimensions = require("./useWindowDimensions");
const { transformStyleTuples } = require("./cssUtil");

/*::
import type { StyleTuples } from "./cssUtil";
*/

module.exports = (
  unresolvedStyleTuples /*: StyleTuples */
) /*: StyleTuples */ => {
  const windowDimensions = useWindowDimensions();

  return React.useMemo(() => {
    const styleTuples = unresolvedStyleTuples.map(([prop, value]) => [
      prop,
      transformViewport(value, windowDimensions)
    ]);
    return transformStyleTuples(styleTuples);
  }, [unresolvedStyleTuples, windowDimensions]);
};

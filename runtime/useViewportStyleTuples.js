// @flow
/*
CAUTION!

This file could be included even after running the babel plugin.

Make sure you don't import large libraries.
*/
const React = require("react");
const useWindowDimensions = require("./useWindowDimensions");
const transformViewport = require("./css-transforms/viewport");

/*::
import type { StyleTuples } from "./cssUtil";
*/

module.exports = (
  unresolvedStyleTuples /*: StyleTuples */
) /*: StyleTuples */ => {
  const windowDimensions = useWindowDimensions();

  return React.useMemo(() => {
    return unresolvedStyleTuples.map(([prop, value]) => [
      prop,
      transformViewport(value, windowDimensions)
    ]);
  }, [unresolvedStyleTuples, windowDimensions]);
};

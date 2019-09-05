// @flow
const React = require("react");
const { transformStyleTuples } = require("./cssUtil");

/*::
import type { StyleTuples } from "./cssUtil";
import type { Variables } from "./VariablesContext";
*/

module.exports = (
  unresolvedStyleTuples /*: StyleTuples[] */,
  customProperties /*: Variables */
) /*: any */ => {
  return React.useMemo(() => {
    const styleSheet = {};

    for (let i = 0; i < unresolvedStyleTuples.length; i += 1) {
      styleSheet[i] = transformStyleTuples(
        unresolvedStyleTuples[i],
        customProperties
      );
    }

    return styleSheet;
  }, [unresolvedStyleTuples, customProperties]);
};

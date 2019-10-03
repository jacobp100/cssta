// @flow
const React = require("react");
const { transformStyleTuples } = require("./cssUtil");

/*::
import type { StyleTuples } from "./cssUtil";
import type { Variables } from "./VariablesContext";
*/

module.exports = (
  unresolvedStyleTuples /*: StyleTuples */,
  customProperties /*: Variables */
) /*: any */ => {
  return React.useMemo(
    () => transformStyleTuples(unresolvedStyleTuples, customProperties),
    [unresolvedStyleTuples, customProperties]
  );
};

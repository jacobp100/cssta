// @flow
const React = require("react");
const variables = require("./css-transforms/variables");

/*::
import type { Variables } from "./VariablesContext";
*/

module.exports = (
  unresolvedShorthandParts /*: Array<{ [key:string]: string }> */,
  customProperties /*: Variables */
) /*: Array<{ [key:string]: string }> */ => {
  return React.useMemo(() => {
    return unresolvedShorthandParts.map(part => {
      const accum = {};
      Object.keys(part).forEach(key => {
        accum[key] = variables(part[key], customProperties);
      });
      return accum;
    });
  }, [unresolvedShorthandParts, customProperties]);
};

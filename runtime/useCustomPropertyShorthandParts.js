const React = require("react");
const variables = require("./css-transforms/variables");

module.exports = (unresolvedShortHandParts, customProperties) => {
  return React.useMemo(() => {
    return unresolvedShortHandParts.map(part => {
      const accum = {};
      Object.keys(part).forEach(key => {
        accum[key] = variables(part[key], customProperties);
      });
      return accum;
    });
  }, [unresolvedShortHandParts, customProperties]);
};

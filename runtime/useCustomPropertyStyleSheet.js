const React = require("react");
const { transformStyleTuples } = require("./cssUtil");

module.exports = (unresolvedStyleTuples, customProperties) => {
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

const { createTopLevelVariable, jsonToNode } = require("../util");

module.exports.createTopLevelStyleTuplesVariable = (
  babel,
  path,
  styleTuples
) => {
  const unresolvedStyleTuplesVariable = createTopLevelVariable(
    babel,
    path,
    "unresolvedStyleTuples",
    jsonToNode(babel, styleTuples),
    { prefix0: true }
  );
  return unresolvedStyleTuplesVariable;
};

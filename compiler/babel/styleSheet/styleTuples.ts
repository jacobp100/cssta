import { StyleTuple } from "../../../runtime/cssUtil";
import { createTopLevelVariable, jsonToNode } from "../util";

export const createTopLevelStyleTuplesVariable = (
  babel: any,
  path: any,
  styleTuples: StyleTuple[]
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

import { StyleTuple } from "../../../runtime/cssUtil";
import { SubstitutionMap } from "../extractSubstitutionMap";
import { createTopLevelVariable } from "../util";
import { getStringWithSubstitutedValues } from "./substitutionUtil";

export const createTopLevelStyleTuplesVariable = (
  babel: any,
  path: any,
  substitutionMap: SubstitutionMap,
  styleTuples: StyleTuple[]
) => {
  const { types: t } = babel;
  const styleTuplesNode = t.arrayExpression(
    styleTuples.map(([key, value]) =>
      t.arrayExpression([
        t.stringLiteral(key),
        getStringWithSubstitutedValues(babel, substitutionMap, value),
      ])
    )
  );
  const unresolvedStyleTuplesVariable = createTopLevelVariable(
    babel,
    path,
    "unresolvedStyleTuples",
    styleTuplesNode,
    { prefix0: true }
  );
  return unresolvedStyleTuplesVariable;
};

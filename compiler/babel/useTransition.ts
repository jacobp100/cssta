import flattenTransition from "../../runtime/flattenTransition";
import { ComponentDefinition } from "../css/types";
import { Environment } from "./environment";
import buildCondition from "./buildCondition";
import {
  createTopLevelVariable,
  createVariable,
  jsonToNode,
  getOrCreateImport,
} from "./util";

export default (
  babel: any,
  path: any,
  cssOutput: ComponentDefinition,
  environment: Environment,
  { styleVariable, customPropertiesVariable }
) => {
  const { types: t } = babel;
  const { transitions } = cssOutput;

  // FIXME: We could be more granular than useCustomPropertyShorthandParts whenever one part has a variable in
  const transitionImportsVariables = transitions.some(
    (transition) => transition.importedVariables.length > 0
  );

  let transitionVariable: any;
  let transitionPartsExpression: any;

  if (
    !transitionImportsVariables &&
    transitions.length === 1 &&
    transitions[0].condition == null
  ) {
    transitionVariable = createTopLevelVariable(
      babel,
      path,
      "transition",
      jsonToNode(babel, flattenTransition([transitions[0].part]))
    );
  } else {
    transitionPartsExpression = t.arrayExpression(
      transitions.map(({ condition, part }) => {
        const parts = jsonToNode(babel, part);

        return condition == null
          ? parts
          : t.conditionalExpression(
              buildCondition(babel, condition, environment),
              parts,
              t.nullLiteral()
            );
      })
    );
  }

  if (transitionImportsVariables) {
    const useCustomPropertyShorthandPartsImport = getOrCreateImport(
      babel,
      path,
      "cssta/runtime/useCustomPropertyShorthandParts"
    );
    const unresolvedTransitionPartsVariable = createVariable(
      babel,
      path,
      "unresolvedTransitionParts",
      transitionPartsExpression
    );
    const useCustomPropertyTransition = t.callExpression(
      useCustomPropertyShorthandPartsImport,
      [unresolvedTransitionPartsVariable, customPropertiesVariable]
    );
    transitionPartsExpression = createVariable(
      babel,
      path,
      "transitionParts",
      useCustomPropertyTransition
    );
  }

  if (transitionVariable == null) {
    const flattenTransitionFnImport = getOrCreateImport(
      babel,
      path,
      "cssta/runtime/flattenTransition"
    );
    transitionVariable = createVariable(
      babel,
      path,
      "transition",
      t.callExpression(flattenTransitionFnImport, [transitionPartsExpression])
    );
  }

  const useTransitionImport = getOrCreateImport(
    babel,
    path,
    "cssta/runtime/useTransition"
  );
  path.pushContainer(
    "body",
    t.expressionStatement(
      t.assignmentExpression(
        "=",
        styleVariable,
        t.callExpression(useTransitionImport, [
          transitionVariable,
          styleVariable,
        ])
      )
    )
  );
};

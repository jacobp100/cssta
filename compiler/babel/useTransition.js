const flattenTransition = require("../../runtime/flattenTransition");
const {
  createTopLevelVariable,
  createVariable,
  jsonToNode,
  getOrCreateImport
} = require("./util");

module.exports = (
  babel,
  path,
  rules,
  { selectorFunctions, styleVariable, customPropertiesVariable }
) => {
  const { types: t } = babel;
  const { ruleTuples, importedTransitionVariables } = rules;

  const rulesWithTransitionParts = ruleTuples.filter(
    rule => rule.transitionParts != null
  );

  const needsPartsResolving = importedTransitionVariables.length > 0;

  let transitionVariable;
  let transitionPartsExpression;

  if (!needsPartsResolving && rulesWithTransitionParts.length === 1) {
    const rule = rulesWithTransitionParts[0];

    transitionVariable = createTopLevelVariable(
      babel,
      path,
      "transition",
      jsonToNode(babel, flattenTransition([rule.transitionParts]))
    );
  } else {
    transitionPartsExpression = t.arrayExpression(
      rulesWithTransitionParts.map(rule => {
        const parts = jsonToNode(babel, rule.transitionParts);
        const ruleCondition = selectorFunctions.get(rule);

        return ruleCondition == null
          ? parts
          : t.conditionalExpression(ruleCondition, parts, t.nullLiteral());
      })
    );
  }

  if (needsPartsResolving) {
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
          styleVariable
        ])
      )
    )
  );
};

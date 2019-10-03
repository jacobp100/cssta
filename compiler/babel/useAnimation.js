const flattenAnimation = require("../../runtime/flattenAnimation");
const {
  createTopLevelVariable,
  createVariable,
  jsonToNode,
  getOrCreateImport
} = require("./util");

module.exports = (
  babel,
  path,
  cssOutput,
  {
    selectorFunctions,
    styleVariable,
    keyframesVariable,
    customPropertiesVariable
  }
) => {
  const { types: t } = babel;
  const { rules } = cssOutput;

  // FIXME: We could be more granular than useCustomPropertyShorthandParts whenever one part has a variable in
  const importedAnimationVariables = rules
    .map(rule => rule.importedAnimationVariables)
    .reduce((a, b) => a.concat(b), []);

  const rulesWithAnimationParts = rules.filter(
    rule => rule.animationParts != null
  );

  const needsPartsResolving = importedAnimationVariables.length > 0;

  let animationExpression;
  let animationPartsExpression;

  if (rulesWithAnimationParts.length === 0) {
    animationExpression = t.nullLiteral();
  } else if (!needsPartsResolving && rulesWithAnimationParts.length === 1) {
    const rule = rulesWithAnimationParts[0];

    animationExpression = createTopLevelVariable(
      babel,
      path,
      "animation",
      jsonToNode(babel, flattenAnimation([rule.animationParts]))
    );
  } else {
    animationPartsExpression = t.arrayExpression(
      rulesWithAnimationParts.map(rule => {
        const parts = jsonToNode(babel, rule.animationParts);
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
    const unresolvedAnimationPartsVariable = createVariable(
      babel,
      path,
      "unresolvedAnimationParts",
      animationPartsExpression
    );
    const useCustomPropertyAnimation = t.callExpression(
      useCustomPropertyShorthandPartsImport,
      [unresolvedAnimationPartsVariable, customPropertiesVariable]
    );
    animationPartsExpression = createVariable(
      babel,
      path,
      "animationParts",
      useCustomPropertyAnimation
    );
  }

  if (animationExpression == null) {
    const flattenAnimationFnImport = getOrCreateImport(
      babel,
      path,
      "cssta/runtime/flattenAnimation"
    );
    animationExpression = createVariable(
      babel,
      path,
      "animation",
      t.callExpression(flattenAnimationFnImport, [animationPartsExpression])
    );
  }

  const useAnimationImport = getOrCreateImport(
    babel,
    path,
    "cssta/runtime/useAnimation"
  );
  path.pushContainer(
    "body",
    t.expressionStatement(
      t.assignmentExpression(
        "=",
        styleVariable,
        t.callExpression(useAnimationImport, [
          keyframesVariable,
          animationExpression,
          styleVariable
        ])
      )
    )
  );
};

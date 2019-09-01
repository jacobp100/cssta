const { keyBloom } = require("../../runtime/bloomFilter");
const {
  createTopLevelVariable,
  createVariable,
  getOrCreateImport
} = require("./util");

module.exports = (babel, path, rules, { selectorFunctions }) => {
  const { types: t } = babel;
  const {
    ruleTuples,
    importedRuleVariables,
    importedTransitionVariables,
    importedAnimationVariables,
    importedKeyframeVariables
  } = rules;

  const rulesWithExportedVariables = ruleTuples.filter(
    rule => Object.keys(rule.exportedVariables).length !== 0
  );

  let bloomFilterExpression;
  let exportedVariablesExpression;

  if (rulesWithExportedVariables.length === 0) {
    /*
    We can use a bloom filter to ignore updates from variables we don't use, but
    we can only do this if we do not export variables. Otherwise we will skip
    updates from variables from child components
    */
    const allImports = new Set([
      ...importedRuleVariables,
      ...importedTransitionVariables,
      ...importedAnimationVariables,
      ...importedKeyframeVariables
    ]);
    const bloomFilter = Array.from(allImports, keyBloom).reduce(
      (a, b) => a | b
    );
    exportedVariablesExpression = t.nullLiteral();
    bloomFilterExpression = t.numericLiteral(bloomFilter);
    bloomFilterExpression = null; // Not supported by React yet :(
  } else if (rulesWithExportedVariables.length === 1) {
    const rule = rulesWithExportedVariables[0];
    const constantExportedVariables = t.objectExpression(
      Object.entries(rule.exportedVariables).map(([key, value]) =>
        t.objectProperty(t.stringLiteral(key), t.stringLiteral(value))
      )
    );
    const constantExportedVariablesVariable = createTopLevelVariable(
      babel,
      path,
      "exportedCustomProperties",
      constantExportedVariables
    );

    const ruleCondition = selectorFunctions.get(rule);
    exportedVariablesExpression =
      ruleCondition != null
        ? t.conditionalExpression(
            ruleCondition,
            constantExportedVariablesVariable,
            t.undefinedLiteral
          )
        : constantExportedVariablesVariable;
  } else {
    const exportedPropertiesVariable = createVariable(
      babel,
      path,
      "exportedCustomProperties",
      t.objectExpression([])
    );

    rulesWithExportedVariables.forEach(rule => {
      const assignments = Object.entries(rule.exportedVariables).map(
        ([key, value]) =>
          t.expressionStatement(
            t.assignmentExpression(
              "=",
              t.memberExpression(
                exportedPropertiesVariable,
                t.stringLiteral(key),
                true /* computed */
              ),
              t.stringLiteral(value)
            )
          )
      );
      const ruleCondition = selectorFunctions.get(rule);

      if (ruleCondition == null) {
        path.pushContainer("body", assignments);
      } else {
        path.pushContainer(
          "body",
          t.ifStatement(ruleCondition, t.blockStatement(assignments))
        );
      }
    });

    exportedVariablesExpression = exportedPropertiesVariable;
  }

  const useCustomPropertiesImport = getOrCreateImport(
    babel,
    path,
    "cssta/runtime/useCustomProperties"
  );
  const customProperties = t.callExpression(
    useCustomPropertiesImport,
    bloomFilterExpression != null
      ? [exportedVariablesExpression, bloomFilterExpression]
      : [exportedVariablesExpression]
  );
  const customPropertiesVariable = createVariable(
    babel,
    path,
    "customProperties",
    customProperties
  );

  return customPropertiesVariable;
};

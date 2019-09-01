const {
  createTopLevelVariable,
  createVariable,
  jsonToNode,
  getOrCreateImport
} = require("../util");
const styleBody = require("./styleBody");

const createStaticStyleSheet = (
  babel,
  path,
  { substitutionMap, ruleTuplesWithStyleTuples }
) => {
  const { types: t } = babel;

  const styleSheet = t.objectExpression(
    ruleTuplesWithStyleTuples.map(({ styleTuples }, i) =>
      t.objectProperty(
        t.numericLiteral(i),
        styleBody(babel, path, substitutionMap, styleTuples)
      )
    )
  );

  const styleSheetVariable = createTopLevelVariable(
    babel,
    path,
    "styles",
    styleSheet
  );

  return styleSheetVariable;
};

const createUseCustomPropertyStyles = (
  babel,
  path,
  { customPropertiesVariable, ruleTuplesWithStyleTuples }
) => {
  const { types: t } = babel;

  const ruleTuples = jsonToNode(
    babel,
    ruleTuplesWithStyleTuples.map(rule => rule.styleTuples)
  );

  const unresolvedStyleTuplesVariable = createTopLevelVariable(
    babel,
    path,
    "unresolvedStyleTuples",
    ruleTuples
  );

  const useCustomPropertyStyleSheetImport = getOrCreateImport(
    babel,
    path,
    "cssta/runtime/useCustomPropertyStyleSheet"
  );
  const styleSheetVariable = createVariable(
    babel,
    path,
    "styles",
    t.callExpression(useCustomPropertyStyleSheetImport, [
      unresolvedStyleTuplesVariable,
      customPropertiesVariable
    ])
  );

  return styleSheetVariable;
};

module.exports = (
  babel,
  path,
  rules,
  { substitutionMap, customPropertiesVariable }
) => {
  const { ruleTuples, importedRuleVariables } = rules;

  const ruleTuplesWithStyleTuples = ruleTuples.filter(
    ruleTuple => ruleTuple.styleTuples.length > 0
  );

  let styleSheetVariable;
  if (importedRuleVariables.length > 0) {
    styleSheetVariable = createUseCustomPropertyStyles(babel, path, {
      // FIXME: substitutionMap
      ruleTuplesWithStyleTuples,
      customPropertiesVariable
    });
  } else if (ruleTuplesWithStyleTuples.length > 0) {
    styleSheetVariable = createStaticStyleSheet(babel, path, {
      substitutionMap,
      ruleTuplesWithStyleTuples
    });
  }

  return styleSheetVariable;
};

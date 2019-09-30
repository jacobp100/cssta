const {
  createTopLevelVariable,
  createVariable,
  jsonToNode,
  getOrCreateImport
} = require("../util");
const styleBody = require("./styleBody");
const {
  NO_FLAGS,
  FLAG_SUPERSETS_PREVIOUS_STYLE
} = require("./optimizationFlags");

const createStaticStyleSheet = (
  babel,
  path,
  { substitutionMap, ruleTuplesWithStyleTuples, comment }
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

  if (comment != null) {
    styleSheet.leadingComments = [
      { type: "CommentBlock", value: ` ${comment} ` }
    ];
  }

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

const mergeFirstStyleIntoAllRuleTuples = ruleTuplesWithStyleTuples => {
  const mergeeRuleTuple = ruleTuplesWithStyleTuples[0];
  const ruleTuplesWithStyleTuplesMerged = ruleTuplesWithStyleTuples.map(
    ruleTuple => {
      if (ruleTuple === mergeeRuleTuple) return ruleTuple;

      const ownStyleKeys = new Set(
        ruleTuple.styleTuples.map(styleTuple => styleTuple[0])
      );
      const stylesToMerge = mergeeRuleTuple.styleTuples.filter(
        styleTuple => !ownStyleKeys.has(styleTuple[0])
      );

      if (stylesToMerge.length === 0) return ruleTuple;

      const mergedStyleTuples = [...stylesToMerge, ...ruleTuple.styleTuples];
      return { ...ruleTuple, styleTuples: mergedStyleTuples };
    }
  );
  return ruleTuplesWithStyleTuplesMerged;
};

const getOptimizationFlags = ruleTuplesWithStyleTuples => {
  let lastStyleKeys = null;
  return ruleTuplesWithStyleTuples.map(ruleTuple => {
    const ownStyleKeys = ruleTuple.styleTuples.map(styleTuple => styleTuple[0]);

    const supersets =
      lastStyleKeys != null &&
      ownStyleKeys.every(key => lastStyleKeys.has(key));

    lastStyleKeys = new Set(ownStyleKeys);

    return supersets ? FLAG_SUPERSETS_PREVIOUS_STYLE : NO_FLAGS;
  });
};

module.exports = (
  babel,
  path,
  rules,
  { substitutionMap, selectorFunctions, customPropertiesVariable }
) => {
  const { ruleTuples, importedRuleVariables } = rules;

  const ruleTuplesWithStyleTuples = ruleTuples.filter(
    ruleTuple => ruleTuple.styleTuples.length > 0
  );

  let styleSheetVariable;
  let stylesheetOptimizationFlags;
  if (importedRuleVariables.length > 0) {
    stylesheetOptimizationFlags = ruleTuplesWithStyleTuples.map(() => NO_FLAGS);
    styleSheetVariable = createUseCustomPropertyStyles(babel, path, {
      // FIXME: substitutionMap
      ruleTuplesWithStyleTuples,
      customPropertiesVariable
    });
  } else if (
    ruleTuplesWithStyleTuples.length === 2 &&
    !selectorFunctions.has(ruleTuplesWithStyleTuples[0])
  ) {
    stylesheetOptimizationFlags = [NO_FLAGS, FLAG_SUPERSETS_PREVIOUS_STYLE];
    const mergedStyleTuples = mergeFirstStyleIntoAllRuleTuples(
      ruleTuplesWithStyleTuples
    );
    const didMergeStyleTuples = ruleTuplesWithStyleTuples.some(
      (ruleTuple, i) => ruleTuple !== mergedStyleTuples[i]
    );
    styleSheetVariable = createStaticStyleSheet(babel, path, {
      substitutionMap,
      ruleTuplesWithStyleTuples: mergedStyleTuples,
      comment: didMergeStyleTuples
        ? "Some styles have been duplicated to improve performance"
        : null
    });
  } else if (ruleTuplesWithStyleTuples.length > 0) {
    stylesheetOptimizationFlags = getOptimizationFlags(
      ruleTuplesWithStyleTuples
    );
    styleSheetVariable = createStaticStyleSheet(babel, path, {
      substitutionMap,
      ruleTuplesWithStyleTuples
    });
  }

  return { styleSheetVariable, stylesheetOptimizationFlags };
};

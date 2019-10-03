const {
  createTopLevelVariable,
  createVariable,
  getOrCreateImport
} = require("../util");
const styleBody = require("./styleBody");
const { createTopLevelStyleTuplesVariable } = require("./styleTuples");
const {
  VIEW_PORT_UNITS_NONE,
  VIEWPORT_UNITS_SIMPLE_LENGTH_ONLY,
  VIEWPORT_UNITS_COMPLEX,
  getViewportMode,
  interpolateViewportUnits
} = require("./viewport");
const {
  NO_FLAGS,
  FLAG_SUPERSETS_PREVIOUS_STYLE
} = require("./optimizationFlags");

const createVariablesStyleExpression = (
  babel,
  path,
  { substitutionMap, customPropertiesVariable, viewportMode },
  styleTuples
) => {
  const { types: t } = babel;

  const baseUnresolvedStyleTuplesVariable = createTopLevelStyleTuplesVariable(
    babel,
    path,
    styleTuples
  );

  let unresolvedStyleTuplesVariable;
  if (viewportMode === VIEW_PORT_UNITS_NONE) {
    unresolvedStyleTuplesVariable = baseUnresolvedStyleTuplesVariable;
  } else {
    if (Object.keys(substitutionMap).length !== 0) {
      throw new Error(
        "String interpolation (${value}) is not yet supported when in combination with viewport units or CSS custom properties"
      );
    }

    const useViewportStyleTuplesImport = getOrCreateImport(
      babel,
      path,
      "cssta/runtime/useViewportStyleTuples"
    );
    unresolvedStyleTuplesVariable = createVariable(
      babel,
      path,
      "unresolvedStyleTuples",
      t.callExpression(useViewportStyleTuplesImport, [
        baseUnresolvedStyleTuplesVariable
      ]),
      { prefix0: true }
    );
  }

  const useCustomPropertyStylesImport = getOrCreateImport(
    babel,
    path,
    "cssta/runtime/useCustomPropertyStyles"
  );
  const styleExpression = createVariable(
    babel,
    path,
    "styles",
    t.callExpression(useCustomPropertyStylesImport, [
      unresolvedStyleTuplesVariable,
      customPropertiesVariable
    ])
  );
  return styleExpression;
};

const createStyle = (
  babel,
  path,
  { substitutionMap, environment, customPropertiesVariable, comment },
  rule
) => {
  const { types: t } = babel;
  const { styleTuples, importedStyleTupleVariables } = rule;

  const viewportMode = getViewportMode(rule);
  const importsVariables = importedStyleTupleVariables.length !== 0;

  let styleExpression;
  if (importsVariables) {
    styleExpression = createVariablesStyleExpression(
      babel,
      path,
      { substitutionMap, customPropertiesVariable, viewportMode },
      styleTuples
    );
  } else if (viewportMode === VIEWPORT_UNITS_COMPLEX) {
    const unresolvedStyleTuplesVariable = createTopLevelStyleTuplesVariable(
      babel,
      path,
      styleTuples
    );
    const cssToReactNativeImport = getOrCreateImport(
      babel,
      path,
      "cssta/runtime/useViewportStyle"
    );
    styleExpression = createVariable(
      babel,
      path,
      "styles",
      t.callExpression(cssToReactNativeImport, [unresolvedStyleTuplesVariable]),
      { prefix0: true }
    );
  } else if (viewportMode === VIEWPORT_UNITS_SIMPLE_LENGTH_ONLY) {
    const [
      nextSubstitutionMap,
      styleTuplesWithViewportSubstitutions
    ] = interpolateViewportUnits(
      babel,
      { substitutionMap, environment },
      styleTuples
    );
    styleExpression = styleBody(
      babel,
      path,
      nextSubstitutionMap,
      styleTuplesWithViewportSubstitutions
    );
  } else {
    const style = styleBody(babel, path, substitutionMap, styleTuples);

    if (comment != null) {
      style.leadingComments = [{ type: "CommentBlock", value: ` ${comment} ` }];
    }

    styleExpression = createTopLevelVariable(babel, path, "styles", style, {
      prefix0: true
    });
  }

  return styleExpression;
};

const mergeFirstStyleIntoAllRules = rulesWithStyleTuples => {
  const mergeeRule = rulesWithStyleTuples[0];
  const rulesWithStyleTuplesMerged = rulesWithStyleTuples.map(rule => {
    if (rule === mergeeRule) return rule;

    const ownStyleKeys = new Set(
      rule.styleTuples.map(styleTuple => styleTuple[0])
    );
    const stylesToMerge = mergeeRule.styleTuples.filter(
      styleTuple => !ownStyleKeys.has(styleTuple[0])
    );

    if (stylesToMerge.length === 0) return rule;

    const mergedStyleTuples = [...stylesToMerge, ...rule.styleTuples];
    return { ...rule, styleTuples: mergedStyleTuples };
  });
  return rulesWithStyleTuplesMerged;
};

const getOptimizationFlags = rulesWithStyleTuples => {
  let lastStyleKeys = null;
  return rulesWithStyleTuples.map(rule => {
    const ownStyleKeys = rule.styleTuples.map(styleTuple => styleTuple[0]);

    const supersets =
      lastStyleKeys != null &&
      lastStyleKeys.every(key => ownStyleKeys.includes(key));

    lastStyleKeys = ownStyleKeys;

    return supersets ? FLAG_SUPERSETS_PREVIOUS_STYLE : NO_FLAGS;
  });
};

module.exports = (
  babel,
  path,
  { rules },
  { substitutionMap, environment, selectorFunctions, customPropertiesVariable }
) => {
  const rulesWithStyleTuples = rules.filter(
    rule => rule.styleTuples.length > 0
  );

  let styleSheetExpressions;
  let stylesheetOptimizationFlags;
  if (
    rulesWithStyleTuples.length === 2 &&
    !selectorFunctions.has(rulesWithStyleTuples[0])
  ) {
    stylesheetOptimizationFlags = [NO_FLAGS, FLAG_SUPERSETS_PREVIOUS_STYLE];
    const mergedStyleTuples = mergeFirstStyleIntoAllRules(rulesWithStyleTuples);
    styleSheetExpressions = mergedStyleTuples.map((rule, i) => {
      const didMergeStyleTuples = rule !== mergedStyleTuples[i];
      const comment = didMergeStyleTuples
        ? "Some styles have been duplicated to improve performance"
        : null;
      return createStyle(
        babel,
        path,
        { substitutionMap, environment, customPropertiesVariable, comment },
        rule
      );
    });
  } else if (rulesWithStyleTuples.length > 0) {
    stylesheetOptimizationFlags = getOptimizationFlags(rulesWithStyleTuples);
    styleSheetExpressions = rulesWithStyleTuples.map(rule =>
      createStyle(
        babel,
        path,
        { substitutionMap, environment, customPropertiesVariable },
        rule
      )
    );
  } else {
    styleSheetExpressions = [];
    stylesheetOptimizationFlags = [];
  }

  const styleSheetRuleExpressions = rulesWithStyleTuples.map((rule, i) => ({
    rule,
    expression: styleSheetExpressions[i]
  }));

  return { styleSheetRuleExpressions, stylesheetOptimizationFlags };
};

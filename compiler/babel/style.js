const {
  FLAG_SUPERSETS_PREVIOUS_STYLE
} = require("./styleSheet/optimizationFlags");
const { createVariable } = require("./util");

module.exports = (
  babel,
  path,
  rules,
  {
    propsVariable,
    selectorFunctions,
    styleSheetVariable,
    stylesheetOptimizationFlags,
    willModifyStyle
  }
) => {
  const { types: t } = babel;
  const { ruleTuples } = rules;

  const ruleTuplesWithStyleTuples = ruleTuples.filter(
    ruleTuple => ruleTuple.styleTuples.length > 0
  );

  let styleExpression;
  const propsStyle = t.memberExpression(propsVariable, t.identifier("style"));
  const styleExpressions = ruleTuplesWithStyleTuples
    .reduce((accum, rule, i) => {
      const optimizationFlags = stylesheetOptimizationFlags[i];
      let styleGroup;
      if (optimizationFlags == FLAG_SUPERSETS_PREVIOUS_STYLE) {
        styleGroup = accum[accum.length - 1];
      } else {
        styleGroup = [];
        accum.push(styleGroup);
      }
      styleGroup.push({ rule, i });
      return accum;
    }, [])
    .map(rules => {
      const ruleExpression = rules.reduce((accum, { rule, i }) => {
        const csstaStyle = t.memberExpression(
          styleSheetVariable,
          t.numericLiteral(i),
          true
        );
        const ruleCondition = selectorFunctions.get(rule);

        if (ruleCondition == null) return csstaStyle;

        const previousStyle = accum == null ? t.nullLiteral() : accum;
        return t.conditionalExpression(
          ruleCondition,
          csstaStyle,
          previousStyle
        );
      }, null);

      return ruleExpression;
    });

  if (styleExpressions.length === 0) {
    styleExpression = willModifyStyle ? propsStyle : null;
  } else if (styleExpressions.length === 1) {
    let baseStyleExpression;
    if (!t.isConditionalExpression(styleExpressions[0])) {
      baseStyleExpression = styleExpressions[0];
    } else {
      baseStyleExpression = createVariable(
        babel,
        path,
        "baseStyle",
        styleExpressions[0]
      );
    }
    styleExpression = t.conditionalExpression(
      t.binaryExpression("!=", propsStyle, t.nullLiteral()),
      t.arrayExpression([baseStyleExpression, propsStyle]),
      baseStyleExpression
    );
  } else {
    styleExpression = t.arrayExpression([...styleExpressions, propsStyle]);
  }

  let styleVariable;
  if (styleExpression != null) {
    styleVariable = createVariable(babel, path, "style", styleExpression, {
      kind: willModifyStyle ? "let" : "const"
    });
  }

  return styleVariable;
};

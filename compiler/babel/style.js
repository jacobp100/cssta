const {
  FLAG_SUPERSETS_PREVIOUS_STYLE
} = require("./styleSheet/optimizationFlags");
const { createVariable } = require("./util");

module.exports = (
  babel,
  path,
  {
    propsVariable,
    selectorFunctions,
    styleSheetRuleExpressions,
    stylesheetOptimizationFlags,
    willModifyStyle = false
  }
) => {
  const { types: t } = babel;

  let styleExpression;
  const propsStyle =
    propsVariable != null
      ? t.memberExpression(propsVariable, t.identifier("style"))
      : null;

  const styleExpressions = styleSheetRuleExpressions
    .reduce((accum, expression, i) => {
      const optimizationFlags = stylesheetOptimizationFlags[i];
      let styleGroup;
      if (optimizationFlags == FLAG_SUPERSETS_PREVIOUS_STYLE) {
        styleGroup = accum[accum.length - 1];
      } else {
        styleGroup = [];
        accum.push(styleGroup);
      }
      styleGroup.push(expression);
      return accum;
    }, [])
    .map(expressionGroup => {
      const ruleExpression = expressionGroup.reduce(
        (accum, { rule, expression }) => {
          const ruleCondition = selectorFunctions.get(rule);

          if (ruleCondition == null) return expression;

          const previousStyle = accum == null ? t.nullLiteral() : accum;
          return t.conditionalExpression(
            ruleCondition,
            expression,
            previousStyle
          );
        },
        null
      );

      return ruleExpression;
    });

  if (styleExpressions.length === 0) {
    styleExpression = willModifyStyle ? propsStyle : null;
  } else if (styleExpressions.length === 1) {
    let baseStyleExpression;
    if (t.isIdentifier(styleExpressions[0])) {
      baseStyleExpression = styleExpressions[0];
    } else {
      baseStyleExpression = createVariable(
        babel,
        path,
        "baseStyle",
        styleExpressions[0]
      );
    }
    styleExpression =
      propsStyle != null
        ? t.conditionalExpression(
            t.binaryExpression("!=", propsStyle, t.nullLiteral()),
            t.arrayExpression([baseStyleExpression, propsStyle]),
            baseStyleExpression
          )
        : baseStyleExpression;
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

const { createVariable } = require("./util");

const createSimpleStyleExpression = (
  babel,
  { propsVariable, styleSheetVariable }
) => {
  const { types: t } = babel;
  const propsStyle = t.memberExpression(propsVariable, t.identifier("style"));
  const csstaStyle = t.memberExpression(
    styleSheetVariable,
    t.numericLiteral(0),
    true
  );
  return t.conditionalExpression(
    t.binaryExpression("!=", propsStyle, t.nullLiteral()),
    t.arrayExpression([csstaStyle, propsStyle]),
    csstaStyle
  );
};

const createMultipleStyleExpression = (
  babel,
  {
    ruleTuplesWithStyleTuples,
    propsVariable,
    selectorFunctions,
    styleSheetVariable
  }
) => {
  const { types: t } = babel;

  return t.arrayExpression([
    ...ruleTuplesWithStyleTuples.map((rule, i) => {
      const styleSheet = t.memberExpression(
        styleSheetVariable,
        t.numericLiteral(i),
        true
      );
      const ruleCondition = selectorFunctions.get(rule.selector);
      return ruleCondition == null
        ? styleSheet
        : t.conditionalExpression(ruleCondition, styleSheet, t.nullLiteral());
    }),
    t.memberExpression(propsVariable, t.identifier("style"))
  ]);
};

module.exports = (
  babel,
  path,
  rules,
  { propsVariable, selectorFunctions, styleSheetVariable, willModifyStyle }
) => {
  const { types: t } = babel;
  const { ruleTuples } = rules;

  const ruleTuplesWithStyleTuples = ruleTuples.filter(
    ruleTuple => ruleTuple.styleTuples.length > 0
  );

  let styleExpression;
  if (ruleTuplesWithStyleTuples.length === 0) {
    styleExpression = willModifyStyle
      ? t.memberExpression(propsVariable, t.identifier("style"))
      : null;
  } else if (
    ruleTuplesWithStyleTuples.length === 1 &&
    ruleTuplesWithStyleTuples[0].selector == "&" &&
    ruleTuplesWithStyleTuples[0].mediaQuery == null
  ) {
    styleExpression = createSimpleStyleExpression(babel, {
      propsVariable,
      styleSheetVariable
    });
  } else {
    styleExpression = createMultipleStyleExpression(babel, {
      propsVariable,
      selectorFunctions,
      styleSheetVariable,
      ruleTuplesWithStyleTuples
    });
  }

  let styleVariable;
  if (styleExpression != null) {
    styleVariable = createVariable(babel, path, "style", styleExpression, {
      kind: willModifyStyle ? "let" : "const"
    });
  }

  return styleVariable;
};

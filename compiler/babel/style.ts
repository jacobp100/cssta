import { OptimizationFlag, StyleSheetExpression } from "./styleSheet";
import { Environment } from "./environment";
import buildCondition from "./buildCondition";
import { createVariable } from "./util";

export default (
  babel: any,
  path: any,
  environment: Environment,
  {
    propsVariable,
    styleSheetRuleExpressions,
    willModifyStyle = false,
  }: {
    propsVariable?: any;
    styleSheetRuleExpressions: StyleSheetExpression[];
    willModifyStyle?: boolean;
  }
) => {
  const { types: t } = babel;

  let styleExpression: any;
  const propsStyle =
    propsVariable != null
      ? t.memberExpression(propsVariable, t.identifier("style"))
      : null;

  const styleExpressions = styleSheetRuleExpressions
    .reduce((accum: StyleSheetExpression[][], expression) => {
      let styleGroup: StyleSheetExpression[];
      if (expression.optimizationFlag == OptimizationFlag.SupersetsPrevious) {
        styleGroup = accum[accum.length - 1];
      } else {
        styleGroup = [];
        accum.push(styleGroup);
      }
      styleGroup.push(expression);
      return accum;
    }, [])
    .map((expressionGroup) => {
      const ruleExpression = expressionGroup.reduce(
        (accum, { condition, expression }) => {
          if (condition == null) return expression;

          const previousStyle = accum == null ? t.nullLiteral() : accum;
          return t.conditionalExpression(
            buildCondition(babel, condition, environment),
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
    let baseStyleExpression: any;
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

  let styleVariable: any;
  if (styleExpression != null) {
    styleVariable = createVariable(babel, path, "style", styleExpression, {
      kind: willModifyStyle ? "let" : "const",
    });
  }

  return styleVariable;
};

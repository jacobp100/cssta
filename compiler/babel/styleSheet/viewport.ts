import { getPropertyName } from "css-to-react-native";
import { viewportUnitRegExp } from "../../../runtime/cssRegExp";
import { StyleTuple } from "../../../runtime/cssUtil";
import { StyleDeclaration } from "../../css/types";
import unitTypes, { UnitType } from "./simpleUnitTypes";

export enum ViewportMode {
  None = 0,
  SimpleLengthUnits = 1,
  ComplexUnits = 2
}

export const getViewportMode = (rule: StyleDeclaration): ViewportMode =>
  rule.styleTuples
    .map(
      ([prop, value]): ViewportMode => {
        if (!viewportUnitRegExp.test(value)) {
          return ViewportMode.None;
        } else if (unitTypes[getPropertyName(prop)] === UnitType.Length) {
          return ViewportMode.SimpleLengthUnits;
        } else {
          return ViewportMode.ComplexUnits;
        }
      }
    )
    .reduce((accum, type) => Math.max(accum, type), ViewportMode.None);

export const interpolateViewportUnits = (
  babel: any,
  { substitutionMap, environment },
  styleTuples: StyleTuple[]
) => {
  const { types: t } = babel;

  const nextSubstitutionMap = { ...substitutionMap };
  let substitutionIndex = 0;
  const styleTuplesWithViewportSubstitutions = styleTuples.map(
    ([prop, value]) => {
      const nextValue = value.replace(viewportUnitRegExp, (m, value, unit) => {
        let multiplier: number;
        switch (unit) {
          case "vw":
            multiplier = environment.getWindowWidth();
            break;
          case "vh":
            multiplier = environment.getWindowHeight();
            break;
          case "vmin":
            multiplier = t.callExpression(
              t.memberExpression(t.identifier("Math"), t.identifier("min")),
              [environment.getWindowWidth(), environment.getWindowHeight()]
            );
            break;
          case "vmax":
            multiplier = t.callExpression(
              t.memberExpression(t.identifier("Math"), t.identifier("max")),
              [environment.getWindowWidth(), environment.getWindowHeight()]
            );
            break;
          default:
            return m;
        }

        const expression = t.binaryExpression(
          "*",
          multiplier,
          t.numericLiteral(+value / 100)
        );

        const substitution = `__viewport-${substitutionIndex}__`;
        substitutionIndex += 1;
        nextSubstitutionMap[substitution] = expression;
        return substitution + "px";
      });

      return [prop, nextValue];
    }
  );

  return [nextSubstitutionMap, styleTuplesWithViewportSubstitutions];
};

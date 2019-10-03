const { getPropertyName } = require("css-to-react-native");
const { viewportUnitRegExp } = require("../../../runtime/cssRegExp");
const { TYPE_LENGTH, unitTypes } = require("./simpleUnitTypes");

const VIEW_PORT_UNITS_NONE = 0;
const VIEWPORT_UNITS_SIMPLE_LENGTH_ONLY = 1;
const VIEWPORT_UNITS_COMPLEX = 2;

module.exports.VIEW_PORT_UNITS_NONE = VIEW_PORT_UNITS_NONE;
module.exports.VIEWPORT_UNITS_SIMPLE_LENGTH_ONLY = VIEWPORT_UNITS_SIMPLE_LENGTH_ONLY;
module.exports.VIEWPORT_UNITS_COMPLEX = VIEWPORT_UNITS_COMPLEX;

module.exports.getViewportMode = rule => {
  return rule.styleTuples
    .map(([prop, value]) => {
      if (!viewportUnitRegExp.test(value)) {
        return VIEW_PORT_UNITS_NONE;
      } else if (unitTypes[getPropertyName(prop)] === TYPE_LENGTH) {
        return VIEWPORT_UNITS_SIMPLE_LENGTH_ONLY;
      } else {
        return VIEWPORT_UNITS_COMPLEX;
      }
    })
    .reduce((accum, type) => Math.max(accum, type), VIEW_PORT_UNITS_NONE);
};

module.exports.interpolateViewportUnits = (
  babel,
  { substitutionMap, environment },
  styleTuples
) => {
  const { types: t } = babel;

  const nextSubstitutionMap = { ...substitutionMap };
  let substitutionIndex = 0;
  const styleTuplesWithViewportSubstitutions = styleTuples.map(
    ([prop, value]) => {
      const nextValue = value.replace(viewportUnitRegExp, (m, value, unit) => {
        let multiplier;
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

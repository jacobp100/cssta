import extractRules from "../css/extractRules";
import { StyleType } from "../css/types";
import extractSubstitutionMap from "./extractSubstitutionMap";
import createEnvironment from "./environment";
import styleSheet from "./styleSheet";
import style from "./style";
import useCustomProperties from "./useCustomProperties";
import { Options } from "../options";

export default (babel: any, nodePath: any, cssNode: any, options?: Options) => {
  const { cssText, substitutionMap } = extractSubstitutionMap(cssNode);
  const cssOutput = extractRules(cssText, options);
  const {
    styles,
    transitions,
    animations,
    keyframes,
    exportedVariables,
  } = cssOutput;

  if (transitions.length !== 0) {
    throw new Error("You cannot define transitions in a mixin");
  } else if (animations.length !== 0) {
    throw new Error("You cannot define animations in a mixin");
  } else if (keyframes.length !== 0) {
    throw new Error("You cannot define keyframes in a mixin");
  } else if (exportedVariables.length !== 0) {
    throw new Error("You cannot define CSS custom properties in a mixin");
  }

  const { types: t } = babel;
  nodePath.replaceWith(t.arrowFunctionExpression([], t.blockStatement([])));
  const path = nodePath.get("body");

  const environment = createEnvironment(babel, path);

  const hasImportedVariables = styles.some(
    (rule) =>
      rule.type === StyleType.Tuples && rule.importedVariables.length !== 0
  );

  let customPropertiesVariable: any;
  if (hasImportedVariables) {
    customPropertiesVariable = useCustomProperties(
      babel,
      path,
      cssOutput,
      environment
    );
  }

  const styleSheetRuleExpressions = styleSheet(
    babel,
    path,
    cssOutput,
    substitutionMap,
    environment,
    { customPropertiesVariable }
  );

  const styleVariable = style(babel, path, environment, {
    styleSheetRuleExpressions,
  });

  path.pushContainer("body", t.returnStatement(styleVariable));

  path.scope.crawl();
};

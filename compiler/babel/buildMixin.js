const extractRules = require("../css/extractRules");
const extractCss = require("./extractCss");
const createEnvironment = require("./environment/createEnvironment");
const selectorsTransform = require("./selectorsTransform");
const styleSheet = require("./styleSheet");
const style = require("./style");
const useCustomProperties = require("./useCustomProperties");

module.exports = (babel, nodePath, options, cssNode) => {
  const { cssText, substitutionMap } = extractCss(babel, cssNode, options);
  const cssOutput = extractRules(cssText);
  const { rules, keyframesStyleTuples } = cssOutput;

  if (Object.keys(keyframesStyleTuples).length !== 0) {
    throw new Error("You cannot define keyframes in a mixin");
  }

  rules.forEach(rule => {
    if (rule.transitionParts != null) {
      throw new Error("You cannot define transitions in a mixin");
    } else if (rule.animationParts != null) {
      throw new Error("You cannot define animations in a mixin");
    } else if (Object.keys(rule.exportedVariables).length !== 0) {
      throw new Error("You cannot export variables in a mixin");
    }
  });

  const { types: t } = babel;
  nodePath.replaceWith(t.arrowFunctionExpression([], t.blockStatement([])));
  const path = nodePath.get("body");

  const environment = createEnvironment(babel, path);

  const selectorFunctions = selectorsTransform(babel, path, cssOutput, {
    environment
  });

  const hasImportedVariables = rules.some(
    rule => rule.importedStyleTupleVariables.length !== 0
  );
  const exportedVariables = rules
    .map(rule => Object.entries(rule.exportedVariables))
    .reduce((a, b) => a.concat(b), []);
  const hasExportedVariables = exportedVariables.length !== 0;

  if (hasExportedVariables) {
    exportedVariables.forEach(([variable, value]) => {
      throw new Error(
        `Mixins cannot export CSS custom properties. See line \`--${variable}: ${value}\``
      );
    });
  }

  let customPropertiesVariable;
  if (hasImportedVariables) {
    customPropertiesVariable = useCustomProperties(babel, path, cssOutput, {
      selectorFunctions
    });
  }

  const { styleSheetRuleExpressions, stylesheetOptimizationFlags } = styleSheet(
    babel,
    path,
    cssOutput,
    {
      substitutionMap,
      environment,
      selectorFunctions,
      customPropertiesVariable
    }
  );

  const styleVariable = style(babel, path, {
    selectorFunctions,
    styleSheetRuleExpressions,
    stylesheetOptimizationFlags
  });

  path.pushContainer("body", t.returnStatement(styleVariable));

  path.scope.crawl();
};

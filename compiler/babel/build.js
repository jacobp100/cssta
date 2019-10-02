const extractRules = require("../css/extractRules");
const extractCss = require("./extractCss");
const selectorsTransform = require("./selectorsTransform");
const styleSheet = require("./styleSheet");
const style = require("./style");
const useCustomProperties = require("./useCustomProperties");
const useTransition = require("./useTransition");
const keyframes = require("./keyframes");
const useAnimation = require("./useAnimation");
const returnElement = require("./returnElement");
const forwardRefComponent = require("./forwardRefComponent");

module.exports = (
  babel,
  nodePath,
  options,
  elementNode,
  cssNode,
  { jsx = false } = {}
) => {
  const { cssText, substitutionMap } = extractCss(babel, cssNode, options);
  const rules = extractRules(cssText);
  const {
    propTypes,
    ruleTuples,
    importedRuleVariables,
    importedTransitionVariables,
    importedAnimationVariables,
    importedKeyframeVariables,
    keyframesStyleTuples
  } = rules;

  const { path, propsVariable, refVariable } = forwardRefComponent(
    babel,
    nodePath,
    { propTypes }
  );

  const selectorFunctions = selectorsTransform(babel, path, rules);

  const hasImportedVariables =
    importedRuleVariables.length !== 0 ||
    importedTransitionVariables.length !== 0 ||
    importedAnimationVariables.length !== 0 ||
    importedKeyframeVariables.length !== 0;
  const exportedVariables = ruleTuples
    .map(rule => Object.entries(rule.exportedVariables))
    .reduce((a, b) => a.concat(b), []);
  const hasExportedVariables = exportedVariables.length !== 0;

  if (hasExportedVariables && options != null && options.globals != null) {
    exportedVariables.forEach(([variable, value]) => {
      if (options.globals[variable] != null) {
        throw new Error(
          `Attempted to overwrite global variable "${variable}". Either change this variable, or remove it from the globals. See line \`--${variable}: ${value}\``
        );
      }
    });
  }

  let customPropertiesVariable;
  if (hasImportedVariables || hasExportedVariables) {
    customPropertiesVariable = useCustomProperties(babel, path, rules, {
      selectorFunctions
    });
  }

  const { styleSheetVariable, stylesheetOptimizationFlags } = styleSheet(
    babel,
    path,
    rules,
    { substitutionMap, selectorFunctions, customPropertiesVariable }
  );

  const hasTransition = ruleTuples.some(
    ruleTuple => ruleTuple.transitionParts != null
  );
  const hasAnimation =
    Object.keys(keyframesStyleTuples).length !== 0 ||
    ruleTuples.some(ruleTuple => ruleTuple.animationParts != null);

  const willModifyStyle = hasTransition || hasAnimation;
  const styleVariable = style(babel, path, rules, {
    propsVariable,
    selectorFunctions,
    styleSheetVariable,
    stylesheetOptimizationFlags,
    willModifyStyle
  });

  if (hasTransition) {
    useTransition(babel, path, rules, {
      selectorFunctions,
      styleVariable,
      customPropertiesVariable
    });
  }

  let keyframesVariable;
  if (Object.keys(keyframesStyleTuples).length !== 0) {
    keyframesVariable = keyframes(babel, path, rules);
  }

  if (hasAnimation) {
    useAnimation(babel, path, rules, {
      selectorFunctions,
      styleVariable,
      keyframesVariable,
      customPropertiesVariable
    });
  }

  returnElement(babel, path, elementNode, {
    jsx,
    propsVariable,
    refVariable,
    styleVariable,
    hasExportedVariables,
    customPropertiesVariable
  });

  path.scope.crawl();
};

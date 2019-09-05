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
  elementNode,
  cssNode,
  { jsx = false } = {}
) => {
  const { cssText, substitutionMap } = extractCss(babel, cssNode);
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
  const hasExportedVariables = ruleTuples.some(
    rule => Object.keys(rule.exportedVariables).length !== 0
  );

  let customPropertiesVariable;
  if (hasImportedVariables || hasExportedVariables) {
    customPropertiesVariable = useCustomProperties(babel, path, rules, {
      selectorFunctions
    });
  }

  const styleSheetVariable = styleSheet(babel, path, rules, {
    substitutionMap,
    customPropertiesVariable
  });

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

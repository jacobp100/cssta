const extractRules = require("../css/extractRules");
const extractCss = require("./extractCss");
const createEnvironment = require("./environment/createEnvironment");
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
  const cssOutput = extractRules(cssText);
  const {
    propTypes,
    rules,
    keyframesStyleTuples,
    importedKeyframeVariables
  } = cssOutput;

  const { path, propsVariable, refVariable } = forwardRefComponent(
    babel,
    nodePath,
    { propTypes }
  );

  const environment = createEnvironment(babel, path);

  const selectorFunctions = selectorsTransform(babel, path, cssOutput, {
    environment
  });

  const hasImportedVariables =
    importedKeyframeVariables.length !== 0 ||
    rules.some(rule => {
      return (
        rule.importedStyleTupleVariables.length !== 0 ||
        rule.importedTransitionVariables.length !== 0 ||
        rule.importedAnimationVariables.length !== 0
      );
    });
  const exportedVariables = rules
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

  const hasTransition = rules.some(rule => rule.transitionParts != null);
  const hasAnimation =
    Object.keys(keyframesStyleTuples).length !== 0 ||
    rules.some(rule => rule.animationParts != null);

  const willModifyStyle = hasTransition || hasAnimation;
  const styleVariable = style(babel, path, {
    propsVariable,
    selectorFunctions,
    styleSheetRuleExpressions,
    stylesheetOptimizationFlags,
    willModifyStyle
  });

  if (hasTransition) {
    useTransition(babel, path, cssOutput, {
      selectorFunctions,
      styleVariable,
      customPropertiesVariable
    });
  }

  let keyframesVariable;
  if (Object.keys(keyframesStyleTuples).length !== 0) {
    keyframesVariable = keyframes(babel, path, cssOutput);
  }

  if (hasAnimation) {
    useAnimation(babel, path, cssOutput, {
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

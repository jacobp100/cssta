// @flow
const extractRules = require("./extractRules");
const { createValidatorForSelector } = require("./selectorTransform");
const withEnhancers = require("./withEnhancers");
const VariablesProvider = require("./VariablesProvider");
const VariablesStyleSheetManager = require("./enhancers/VariablesStyleSheetManager");
const Transition = require("./enhancers/Transition");
const Animation = require("./enhancers/Animation");
/*:: import type { RawVariableArgs, VariableArgs } from './types' */

const dynamicComponent = withEnhancers([
  VariablesStyleSheetManager,
  Transition,
  Animation
]);

const createValidatorsForRules = (
  args /*: RawVariableArgs */
) /*: VariableArgs */ => {
  const {
    transitionedProperties,
    importedVariables,
    keyframesStyleTuples
  } = args;
  const ruleTuples = args.ruleTuples.map(rule => ({
    validate: createValidatorForSelector(rule.selector, rule.mediaQuery),
    styleTuples: rule.styleTuples,
    transitionParts: rule.transitionParts,
    animationParts: rule.animationParts,
    exportedVariables: rule.exportedVariables
  }));
  return {
    transitionedProperties,
    importedVariables,
    keyframesStyleTuples,
    ruleTuples
  };
};

/* eslint-disable no-param-reassign */
module.exports = (element /*: any */) => (
  cssTextFragments /*: string */,
  ...substitutions /*: string[] */
) => {
  substitutions.forEach(sub => {
    if (String(sub).indexOf(";") !== -1) {
      /* eslint-disable no-template-curly-in-string */
      throw new Error(
        "You can only interpolate singlevalues using ${value} notation. " +
          "See https://jacobp100.github.io/cssta/native#custom-properties-interpolation"
      );
      /* eslint-enable */
    }
  });

  const cssText =
    typeof cssTextFragments === "string"
      ? cssTextFragments
      : cssTextFragments[0] +
        substitutions
          .map((value, index) => String(value) + cssTextFragments[index + 1])
          .join("");

  const { propTypes, args: rawArgs } = extractRules(cssText);
  const args = createValidatorsForRules(rawArgs);
  return dynamicComponent(element, propTypes, args);
};

module.exports.VariablesProvider = VariablesProvider;

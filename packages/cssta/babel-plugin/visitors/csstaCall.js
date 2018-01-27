/* eslint-disable no-param-reassign */
const { varRegExp } = require("../../src/util");
const transformWeb = require("../platforms/web");
const transformNative = require("../platforms/native");
const {
  getCsstaReferences,
  interpolationTypes,
  extractCsstaCallParts
} = require("../transformUtil/extractCsstaCallParts");

const canInterpolate = {
  web: false,
  native: true
};

const transformCsstaTypes = {
  web: transformWeb,
  native: transformNative
};

const transformCsstaCall = (path, state, target, stringArg) => {
  const csstaReferenceParts = getCsstaReferences(path, target);
  if (!csstaReferenceParts) return;

  const { callee, component, csstaType } = csstaReferenceParts;

  const interpolationType = canInterpolate[csstaType]
    ? interpolationTypes.ALLOW
    : interpolationTypes.DISALLOW;

  const callParts = extractCsstaCallParts(stringArg, interpolationType);
  if (!callParts) return;

  let { cssText, substitutionMap } = callParts; // eslint-disable-line

  if (state.singleSourceOfVariables) {
    cssText = cssText.replace(
      varRegExp,
      (m, variableName, fallback) =>
        state.singleSourceOfVariables[variableName] || fallback
    );
  }

  transformCsstaTypes[csstaType](
    path,
    state,
    component,
    cssText,
    substitutionMap
  );
  const binding = path.scope.getBinding(callee.name);
  binding.dereference();
};

module.exports = {
  CallExpression(path, state) {
    const { node } = path;
    const { callee } = node;
    const [arg] = node.arguments;
    transformCsstaCall(path, state, callee, arg);
  },
  TaggedTemplateExpression(path, state) {
    const { quasi, tag } = path.node;
    transformCsstaCall(path, state, tag, quasi);
  }
};
module.exports.resetGenerators = transformWeb.resetGenerators;

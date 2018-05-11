/* eslint-disable no-param-reassign */
const { default: annotateAsPure } = require("@babel/helper-annotate-as-pure");
const { varRegExp } = require("../../src/util/cssRegExp");
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

const transformCsstaCall = (babel, path, state, target, stringArg) => {
  const csstaReferenceParts = getCsstaReferences(babel, path, target);
  if (!csstaReferenceParts) return;

  const { callee, component, csstaType } = csstaReferenceParts;

  const interpolationType = canInterpolate[csstaType]
    ? interpolationTypes.ALLOW
    : interpolationTypes.DISALLOW;

  const callParts = extractCsstaCallParts(babel, stringArg, interpolationType);
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
    babel,
    path,
    state,
    component,
    cssText,
    substitutionMap
  );
  const binding = path.scope.getBinding(callee.name);
  binding.dereference();

  annotateAsPure(path);
};

module.exports = {
  CallExpression(babel, path, state) {
    const { node } = path;
    const { callee } = node;
    const [arg] = node.arguments;
    transformCsstaCall(babel, path, state, callee, arg);
  },
  TaggedTemplateExpression(babel, path, state) {
    const { quasi, tag } = path.node;
    transformCsstaCall(babel, path, state, tag, quasi);
  }
};
module.exports.resetGenerators = transformWeb.resetGenerators;

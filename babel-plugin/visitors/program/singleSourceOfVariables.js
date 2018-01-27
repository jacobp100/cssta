/* eslint-disable no-param-reassign */
const p = require("path");
const singleSourceOfVariables = require("../../optimizations/singleSourceOfVariables");
const { getOptimisationOpts } = require("../../util");

module.exports = (babel, path, state) => {
  const singleSourceVariableOpts = !state.singleSourceOfVariables
    ? getOptimisationOpts(state, "singleSourceOfVariables")
    : null;

  if (singleSourceVariableOpts && !singleSourceVariableOpts.sourceFilename) {
    throw new Error(
      "You must provide `sourceFilename` in the options for singleSourceOfVariables"
    );
  }

  if (singleSourceVariableOpts) {
    const fileContainingVariables = p.join(
      state.opts.cwd || process.cwd(),
      singleSourceVariableOpts.sourceFilename
    );
    const exportedVariables = singleSourceOfVariables(
      babel,
      fileContainingVariables,
      state.file.opts
    );
    state.singleSourceOfVariables = exportedVariables;
  }
};

/* eslint-disable no-param-reassign */
const f = require("fs");
const p = require("path");
const singleSourceOfVariables = require("../../optimizations/singleSourceOfVariables");
const { getOptimisationOpts } = require("../../util");

module.exports = (babel, path, state) => {
  const singleSourceVariableOpts = !state.singleSourceOfVariables
    ? getOptimisationOpts(state, "singleSourceOfVariables")
    : null;

  if (singleSourceVariableOpts) {
    let contents;

    if (singleSourceVariableOpts.sourceContents) {
      contents = singleSourceVariableOpts.sourceContents;
    } else if (singleSourceVariableOpts.sourceFilename) {
      const fileContainingVariables = p.join(
        state.opts.cwd || process.cwd(),
        singleSourceVariableOpts.sourceFilename
      );
      contents = f.readFileSync(fileContainingVariables);
    } else {
      throw new Error(
        "You must provide `sourceFilename` in the options for singleSourceOfVariables"
      );
    }

    const exportedVariables = singleSourceOfVariables(babel, contents);
    state.singleSourceOfVariables = exportedVariables;
  }
};

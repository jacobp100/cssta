/* eslint-disable no-param-reassign */
const programWeb = require('./visitors/program/web');
const singleSourceOfVariables = require('./visitors/program/singleSourceOfVariables');
const removeUnusedCsstaImports = require('./visitors/program/removeUnusedCsstaImports');
const redirectImports = require('./visitors/importSpecifier/redirectImports');
const csstaCall = require('./visitors/csstaCall');


module.exports = () => ({
  visitor: {
    Program: {
      enter(path, state) {
        singleSourceOfVariables(path, state);
        programWeb.enter(path, state);
      },
      exit(path, state) {
        programWeb.exit(path, state);
        removeUnusedCsstaImports(path, state);
      },
    },
    ImportSpecifier(path, state) {
      redirectImports(path, state);
    },
    CallExpression(path, state) {
      csstaCall.CallExpression(path, state);
    },
    TaggedTemplateExpression(path, state) {
      csstaCall.TaggedTemplateExpression(path, state);
    },
  },
});

module.exports.resetGenerators = csstaCall.resetGenerators;

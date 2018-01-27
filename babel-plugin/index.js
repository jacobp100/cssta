/* eslint-disable no-param-reassign */
const programWeb = require("./visitors/program/web");
const singleSourceOfVariables = require("./visitors/program/singleSourceOfVariables");
const removeUnusedCsstaImports = require("./visitors/program/removeUnusedCsstaImports");
const redirectImports = require("./visitors/importSpecifier/redirectImports");
const csstaCall = require("./visitors/csstaCall");

module.exports = babel => ({
  name: "cssta",
  visitor: {
    Program: {
      enter(path, state) {
        singleSourceOfVariables(babel, path, state);
        programWeb.enter(path, state);
      },
      exit(path, state) {
        programWeb.exit(path, state);
        removeUnusedCsstaImports(babel, path, state);
      }
    },
    ImportSpecifier(path, state) {
      redirectImports(babel, path, state);
    },
    CallExpression(path, state) {
      csstaCall.CallExpression(babel, path, state);
    },
    TaggedTemplateExpression(path, state) {
      csstaCall.TaggedTemplateExpression(babel, path, state);
    }
  }
});

module.exports.resetGenerators = csstaCall.resetGenerators;

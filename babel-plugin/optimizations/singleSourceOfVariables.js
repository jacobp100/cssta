const _ = require("lodash/fp");
const extractRules = require("../../src/native/extractRules"); // Is this really native-only?
const resolveVariableDependencies = require("../../src/native/enhancers/resolveVariableDependencies");
const {
  getCsstaReferences,
  interpolationTypes,
  extractCsstaCallParts
} = require("../transformUtil/extractCsstaCallParts");
const { containsSubstitution } = require("../util");

const extractVariables = (babel, path, target, stringArg) => {
  const csstaReferenceParts = getCsstaReferences(babel, path, target);
  if (!csstaReferenceParts) return null;

  const callParts = extractCsstaCallParts(
    babel,
    stringArg,
    interpolationTypes.ALLOW
  );
  if (!callParts) return null;

  const { cssText, substitutionMap } = callParts;

  const { args: { ruleTuples } } = extractRules(cssText);
  const rulesWithExportedVariables = _.reject(
    _.conforms({ exportedVariables: _.isEmpty }),
    ruleTuples
  );

  if (_.isEmpty(rulesWithExportedVariables)) return null;

  if (!_.every({ selector: "&" }, rulesWithExportedVariables)) {
    throw new Error(
      "When using singleSourceOfVariables, all variables must be top-level"
    );
  }

  const exportedVariables = _.flow(
    _.map("exportedVariables"),
    _.reduce(_.assign, {})
  )(rulesWithExportedVariables);

  const exportedVariablesContainingSubstitution = _.flow(
    _.values,
    _.filter(containsSubstitution(substitutionMap))
  )(exportedVariables);

  if (!_.isEmpty(exportedVariablesContainingSubstitution)) {
    throw new Error(
      "When using singleSourceOfVariables, you cannot use interpolation within variables"
    );
  }

  return exportedVariables;
};

module.exports = (babel, contents) => {
  const { ast } = babel.transform(contents);

  let exportedVariables = null;
  const doExtractVariables = (path, node, stringArg) => {
    const newExportedVariables = extractVariables(babel, path, node, stringArg);
    if (exportedVariables && newExportedVariables) {
      throw new Error(
        "When using singleSourceOfVariables, only one component can define variables"
      );
    } else if (newExportedVariables) {
      exportedVariables = newExportedVariables;
    }
  };

  babel.traverse(
    ast,
    {
      CallExpression(path) {
        const { node } = path;
        const [arg] = node.arguments;
        doExtractVariables(path, node, arg);
      },
      TaggedTemplateExpression(path) {
        const { quasi, tag } = path.node;
        doExtractVariables(path, tag, quasi);
      }
    },
    null,
    {
      file: { opts: { filename: "intermediate-file" } }
    }
  );

  if (!exportedVariables) {
    throw new Error(
      "Expected given file to contain CSS variables for singleSourceOfVariables"
    );
  }

  const resolvedVariables = resolveVariableDependencies(exportedVariables, {});
  return resolvedVariables;
};

const fs = require('fs');
const { parse } = require('babylon');
const { default: traverse } = require('babel-traverse');
const _ = require('lodash/fp');
const extractRules = require('cssta/src/native/extractRules'); // Is this really native-only?
const {
  getCsstaReferences, interpolationTypes, extractCsstaCallParts,
} = require('../transformUtil/extractCsstaCallParts');
const { containsSubstitution } = require('../util');


const extractVariables = (path, target, stringArg) => {
  const csstaReferenceParts = getCsstaReferences(path, target);
  if (!csstaReferenceParts) return null;

  const callParts = extractCsstaCallParts(stringArg, interpolationTypes.ALLOW);
  if (!callParts) return null;

  const { cssText, substitutionMap } = callParts;

  const { rules } = extractRules(cssText);
  const rulesWithExportedVariables = _.reject(_.conforms({ exportedVariables: _.isEmpty }), rules);

  if (_.isEmpty(rulesWithExportedVariables)) return null;

  if (!_.every({ selector: '&' }, rulesWithExportedVariables)) {
    throw new Error('When using singleSourceOfVariables, all variables must be top-level');
  }

  const exportedVariables = _.flow(
    _.map('exportedVariables'),
    _.reduce(_.assign, {})
  )(rulesWithExportedVariables);

  const exportedVariablesContainingSubstitution = _.flow(
    _.values,
    _.filter(containsSubstitution(substitutionMap))
  )(exportedVariables);

  if (!_.isEmpty(exportedVariablesContainingSubstitution)) {
    throw new Error(
      'When using singleSourceOfVariables, you cannot use interpolation within variables'
    );
  }

  return exportedVariables;
};

module.exports = (filename, fileOpts) => {
  const source = fs.readFileSync(filename, 'utf-8');
  const ast = parse(source, fileOpts);

  let exportedVariables = null;
  const doExtractVariables = (path, node, stringArg) => {
    const newExportedVariables = extractVariables(path, node, stringArg);
    if (exportedVariables && newExportedVariables) {
      throw new Error('When using singleSourceOfVariables, only one component can define variables');
    } else if (newExportedVariables) {
      exportedVariables = newExportedVariables;
    }
  };

  traverse(ast, {
    CallExpression(path) {
      const { node } = path;
      const [arg] = node.arguments;
      doExtractVariables(path, node, arg);
    },
    TaggedTemplateExpression(path) {
      const { quasi, tag } = path.node;
      doExtractVariables(path, tag, quasi);
    },
  }, null, {
    file: { opts: { filename: 'intermediate-file' } },
  });

  if (!exportedVariables) {
    throw new Error('Expected given file to contain CSS variables for singleSourceOfVariables');
  }

  return exportedVariables;
};

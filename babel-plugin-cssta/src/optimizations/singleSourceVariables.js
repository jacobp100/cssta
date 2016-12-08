const fs = require('fs');
const { parse } = require('babylon');
const { default: traverse } = require('babel-traverse');
const _ = require('lodash/fp');
const extractRules = require('cssta/src/native/extractRules'); // Is this really native-only?
const {
  interpolationTypes, extractCsstaCallParts,
} = require('../transformUtil/extractCsstaCallParts');


const extractVariables = (stringArg) => {
  const callParts = extractCsstaCallParts(stringArg, interpolationTypes.DISALLOW);
  if (!callParts) return null;

  const { cssText } = callParts;

  const { rules } = extractRules(cssText);
  const rulesWithExportedVariables = _.filter(rule => !_.isEmpty(rule.exportedVariables), rules);

  if (_.isEmpty(rulesWithExportedVariables)) return null;

  if (!_.every({ selector: '&' }, rulesWithExportedVariables)) {
    throw new Error('When using singleSourceVariables, all variables must be top-level');
  }

  const exportedVariables = _.flow(
    _.map('exportedVariables'),
    _.reduce(_.assign, {})
  )(rulesWithExportedVariables);

  return exportedVariables;
};

module.exports = (filename, fileOpts) => {
  const source = fs.readFileSync(filename, 'utf-8');
  const ast = parse(source, fileOpts);

  let exportedVariables = null;
  const doExtractVariables = (stringArg) => {
    const newExportedVariables = extractVariables(stringArg);
    if (exportedVariables && newExportedVariables) {
      throw new Error('When using singleSourceVariables, only one component can define variables');
    } else if (newExportedVariables) {
      exportedVariables = newExportedVariables;
    }
  };

  traverse(ast, {
    CallExpression(element) {
      const { node } = element;
      const [arg] = node.arguments;
      doExtractVariables(arg);
    },
    TaggedTemplateExpression(element) {
      const { quasi } = element.node;
      doExtractVariables(quasi);
    },
  });

  if (!exportedVariables) {
    throw new Error('Expected given file to contain CSS variables for singleSourceVariables');
  }

  return exportedVariables;
};

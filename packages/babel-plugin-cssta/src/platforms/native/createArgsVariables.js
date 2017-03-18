const t = require('babel-types');
const { jsonToNode } = require('../../util');
const { commonArgs } = require('./createUtil');

module.exports = (path, substitutionMap, rulesBody, args) =>
  t.objectExpression([
    ...commonArgs(args),
    t.objectProperty(
      t.stringLiteral('importedVariables'),
      jsonToNode(args.importedVariables)
    ),
    t.objectProperty(
      t.stringLiteral('keyframesStyleTuples'),
      jsonToNode(args.keyframesStyleTuples)
    ),
    t.objectProperty(
      t.stringLiteral('ruleTuples'),
      rulesBody
    ),
  ]);

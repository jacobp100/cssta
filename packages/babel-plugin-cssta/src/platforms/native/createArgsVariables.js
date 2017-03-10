const t = require('babel-types');
const { jsonToNode } = require('../../util');
const { commonArgs } = require('./createUtil');

module.exports = (path, substitutionMap, rulesBody, args) =>
  t.objectExpression([
    ...commonArgs(rulesBody, args),
    t.objectProperty(
      t.stringLiteral('keyframesStyleTuples'),
      jsonToNode(args.keyframesStyleTuples)
    ),
  ]);

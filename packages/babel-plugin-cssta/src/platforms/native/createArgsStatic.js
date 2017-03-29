const t = require('babel-types');
const createKeyframes = require('./createKeyframes');
const { commonArgs } = require('./createUtil');

module.exports = (path, substitutionMap, rulesBody, args) =>
  t.objectExpression([
    ...commonArgs(args),
    t.objectProperty(
      t.stringLiteral('keyframes'),
      createKeyframes(path, substitutionMap, args.keyframesStyleTuples)
    ),
    t.objectProperty(
      t.stringLiteral('rules'),
      rulesBody
    ),
  ]);

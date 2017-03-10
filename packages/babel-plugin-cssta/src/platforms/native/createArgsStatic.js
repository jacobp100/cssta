const t = require('babel-types');
const createKeyframesStatic = require('./createKeyframesStatic');
const { commonArgs } = require('./createUtil');

module.exports = (path, substitutionMap, rulesBody, args) =>
  t.objectExpression([
    ...commonArgs(rulesBody, args),
    t.objectProperty(
      t.stringLiteral('keyframes'),
      createKeyframesStatic(path, substitutionMap, args.keyframesStyleTuples)
    ),
  ]);

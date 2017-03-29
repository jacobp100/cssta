const _ = require('lodash/fp');
const t = require('babel-types');
const { jsonToNode } = require('../../util');
const createStyleBody = require('./createStyleBody');
const { styleTupleHasVariable } = require('./util');

const keyframeStyleTupleHasVariables = _.flow(
  _.get('styleTuples'),
  _.some(styleTupleHasVariable)
);

const createKeyframeStatic = _.curry((path, substitutionMap, keyframe) => (
  t.objectExpression([
    t.objectProperty(
      t.stringLiteral('time'),
      t.numericLiteral(keyframe.time)
    ),
    t.objectProperty(
      t.stringLiteral('styles'),
      createStyleBody(path, substitutionMap, keyframe.styleTuples)
    ),
  ])
));

const convertKeyframeStyleTuple = _.curry((path, substitutionMap, keyframes) => (
  _.some(keyframeStyleTupleHasVariables, keyframes)
    ? jsonToNode(keyframes)
    : t.arrayExpression(_.map(createKeyframeStatic(path, substitutionMap), keyframes))
));

module.exports = (path, substitutionMap, keyframesStyleTuples) =>
  t.objectExpression(
    _.map(([keyframeName, keyframes]) => t.objectProperty(
      t.stringLiteral(keyframeName),
      convertKeyframeStyleTuple(path, substitutionMap, keyframes)
    ), _.toPairs(keyframesStyleTuples))
  );

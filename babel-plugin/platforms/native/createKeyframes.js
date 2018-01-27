const _ = require("lodash/fp");
const { jsonToNode } = require("../../util");
const createStyleBody = require("./createStyleBody");
const { styleTupleHasVariable } = require("./util");

const keyframeStyleTupleHasVariables = _.flow(
  _.get("styleTuples"),
  _.some(styleTupleHasVariable)
);

const createKeyframeStatic = _.curry((babel, path, substitutionMap, keyframe) =>
  babel.types.objectExpression([
    babel.types.objectProperty(
      babel.types.stringLiteral("time"),
      babel.types.numericLiteral(keyframe.time)
    ),
    babel.types.objectProperty(
      babel.types.stringLiteral("styles"),
      createStyleBody(babel, path, substitutionMap, keyframe.styleTuples)
    )
  ])
);

const convertKeyframeStyleTuple = _.curry(
  (babel, path, substitutionMap, keyframes) =>
    _.some(keyframeStyleTupleHasVariables, keyframes)
      ? jsonToNode(babel, keyframes)
      : babel.types.arrayExpression(
          _.map(createKeyframeStatic(babel, path, substitutionMap), keyframes)
        )
);

module.exports = (babel, path, substitutionMap, keyframesStyleTuples) =>
  babel.types.objectExpression(
    _.map(
      ([keyframeName, keyframes]) =>
        babel.types.objectProperty(
          babel.types.stringLiteral(keyframeName),
          convertKeyframeStyleTuple(babel, path, substitutionMap, keyframes)
        ),
      _.toPairs(keyframesStyleTuples)
    )
  );

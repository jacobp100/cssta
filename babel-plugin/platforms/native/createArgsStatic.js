const createKeyframes = require("./createKeyframes");
const createStyleSheet = require("./createStyleSheet");
const { commonArgs } = require("./createUtil");

module.exports = (babel, path, substitutionMap, args) =>
  babel.types.objectExpression([
    ...commonArgs(babel, args),
    babel.types.objectProperty(
      babel.types.stringLiteral("keyframes"),
      createKeyframes(babel, path, substitutionMap, args.keyframesStyleTuples)
    ),
    babel.types.objectProperty(
      babel.types.stringLiteral("rules"),
      createStyleSheet(babel, path, substitutionMap, args.ruleTuples)
    )
  ]);

const { jsonToNode } = require("../../util");
const createKeyframes = require("./createKeyframes");
const createStyleSheet = require("./createStyleSheet");
const { commonArgs } = require("./createUtil");

module.exports = (babel, path, substitutionMap, args) =>
  babel.types.objectExpression([
    ...commonArgs(babel, args),
    babel.types.objectProperty(
      babel.types.stringLiteral("styleSheetCache"),
      jsonToNode(babel, args.styleSheetCache)
    ),
    babel.types.objectProperty(
      babel.types.stringLiteral("importedVariables"),
      jsonToNode(babel, args.importedVariables)
    ),
    babel.types.objectProperty(
      babel.types.stringLiteral("keyframesStyleTuples"),
      createKeyframes(babel, path, substitutionMap, args.keyframesStyleTuples)
    ),
    babel.types.objectProperty(
      babel.types.stringLiteral("ruleTuples"),
      createStyleSheet(babel, path, substitutionMap, args.ruleTuples)
    )
  ]);

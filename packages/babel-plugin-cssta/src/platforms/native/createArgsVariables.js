const t = require("babel-types");
const { jsonToNode } = require("../../util");
const createKeyframes = require("./createKeyframes");
const createStyleSheet = require("./createStyleSheet");
const { commonArgs } = require("./createUtil");

module.exports = (path, substitutionMap, args) =>
  t.objectExpression([
    ...commonArgs(args),
    t.objectProperty(
      t.stringLiteral("importedVariables"),
      jsonToNode(args.importedVariables)
    ),
    t.objectProperty(
      t.stringLiteral("keyframesStyleTuples"),
      createKeyframes(path, substitutionMap, args.keyframesStyleTuples)
    ),
    t.objectProperty(
      t.stringLiteral("ruleTuples"),
      createStyleSheet(path, substitutionMap, args.ruleTuples)
    )
  ]);

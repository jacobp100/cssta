const t = require('babel-types');
const _ = require('lodash/fp');

const interpolationTypes = {
  ALLOW: 0,
  IGNORE: 1,
  DISALLOW: 2,
};

module.exports.interpolationTypes = interpolationTypes;
module.exports.extractCsstaCallParts = (stringArg, interpolationType) => {
  if (!t.isTemplateLiteral(stringArg) && !t.isStringLiteral(stringArg)) return null;

  const hasInterpolation = t.isTemplateLiteral(stringArg) && !_.isEmpty(stringArg.expressions);

  if (hasInterpolation && interpolationType === interpolationTypes.DISALLOW) {
    const ex = '`color: ${primary}`'; // eslint-disable-line
    throw new Error(`You cannot interpolation in template strings (i.e. ${ex})`);
  }

  const allowInterpolation = interpolationType === interpolationTypes.ALLOW;

  let cssText = null;
  let substitutionMap = {};

  if (t.isTemplateLiteral(stringArg) && (allowInterpolation || !hasInterpolation)) {
    const { quasis, expressions } = stringArg;
    const substitutionNames = expressions.map((value, index) => `__substitution-${index}__`);
    cssText =
      quasis[0].value.cooked +
      substitutionNames.map((name, index) => name + quasis[index + 1].value.cooked).join('');
    substitutionMap = _.fromPairs(_.zip(substitutionNames, expressions));
  } else if (t.isStringLiteral(stringArg)) {
    cssText = stringArg.value;
  }

  if (cssText === null) return null;

  return { cssText, substitutionMap };
};

const t = require('babel-types');
const _ = require('lodash/fp');
const { csstaModules } = require('../util');


const interpolationTypes = {
  ALLOW: 0,
  IGNORE: 1,
  DISALLOW: 2,
};

const csstaConstructorExpressionTypes = {
  CallExpression: node => [node.callee, node.arguments[0]],
  MemberExpression: node => [
    node.object,
    node.computed ? node.property : t.stringLiteral(node.property.name),
  ],
};

const getCsstaTypeForCallee = (path, callee) => {
  if (!t.isIdentifier(callee)) return null;

  const importScopePath = path.findParent(_.has(['scope', 'bindings', callee.name]));
  if (!importScopePath) return null;

  const importSpecifier = _.get(['scope', 'bindings', callee.name, 'path'], importScopePath);
  if (!importSpecifier || !t.isImportDefaultSpecifier(importSpecifier)) return null;

  const importDeclaration = importSpecifier.findParent(t.isImportDeclaration);
  if (!importDeclaration) return null;

  const source = importDeclaration.node.source.value;
  const csstaType = csstaModules[source];
  if (!csstaType) return null;

  return { csstaType, importDeclaration };
};

module.exports.getCsstaReferences = (path, node) => {
  if (!(node.type in csstaConstructorExpressionTypes)) return null;

  const [callee, component] = csstaConstructorExpressionTypes[node.type](node);

  const csstaTypeParts = getCsstaTypeForCallee(path, callee);
  if (!csstaTypeParts) return null;

  const { csstaType, importBinding } = csstaTypeParts;

  return { callee, importBinding, component, csstaType };
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

/* eslint-disable no-param-reassign */
const t = require('babel-types');
const _ = require('lodash/fp');
const { getOrCreateImportReference } = require('../../util');
const createStyleBody = require('./createStyleBody');
const { baseRuleElements } = require('./createUtil');
const { jsonObjectProperties } = require('./util');

module.exports = (path, substitutionMap, rules) => {
  const statementPath = path.getStatementParent();
  const styleSheetReference = statementPath.scope.generateUidIdentifier('csstaStyle');

  let i = 0;
  const getStyleSheetReference = () => {
    const value = i;
    i += 1;
    return t.numericLiteral(value);
  };

  const createStyleBodyForRule = createStyleBody(statementPath, substitutionMap);
  const ruleBases = _.flow(
    _.map(rule => _.set('styleBody', createStyleBodyForRule(rule.styleTuples), rule)),
    _.map(rule => _.set(
      'styleSheetReference',
      rule.styleBody ? getStyleSheetReference() : null,
      rule
    ))
  )(rules);

  const rulesBody = t.arrayExpression(_.map(rule => t.objectExpression([
    ...baseRuleElements(rule),
    ...jsonObjectProperties({
      transitions: rule.transitionParts,
      animation: rule.animationParts,
    }),
    t.objectProperty(
      t.stringLiteral('style'),
      rule.styleSheetReference
        ? t.memberExpression(styleSheetReference, rule.styleSheetReference, true)
        : t.nullLiteral()
    ),
  ]), ruleBases));

  const ruleBasesWithStyles = _.filter(_.get('styleSheetReference'), ruleBases);

  if (!_.isEmpty(ruleBasesWithStyles)) {
    const reactNativeStyleSheetRef =
      getOrCreateImportReference(path, 'react-native', 'StyleSheet');

    const styleSheetBody = t.objectExpression(_.map(rule => (
      t.objectProperty(rule.styleSheetReference, rule.styleBody)
    ), ruleBasesWithStyles));

    const styleSheetElement = t.variableDeclaration('var', [
      t.variableDeclarator(styleSheetReference, t.callExpression(
        t.memberExpression(reactNativeStyleSheetRef, t.identifier('create')),
        [styleSheetBody]
      )),
    ]);

    statementPath.insertBefore(styleSheetElement);
  }

  return rulesBody;
};

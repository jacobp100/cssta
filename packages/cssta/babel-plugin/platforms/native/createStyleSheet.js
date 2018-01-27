/* eslint-disable no-param-reassign */
const t = require("babel-types");
const _ = require("lodash/fp");
const { getPropertyName } = require("css-to-react-native");
const { getOrCreateImportReference } = require("../../util");
const { baseRuleElements } = require("./createUtil");
const {
  jsonObjectProperties,
  getStringWithSubstitutedValues,
  styleHasVariable,
  styleTupleHasVariable
} = require("./util");
const createStyleBody = require("./createStyleBody");

const createStyleTuples = (substitutionMap, { styleTuples }) =>
  t.arrayExpression(
    _.map(
      ([prop, value]) =>
        t.arrayExpression([
          t.stringLiteral(getPropertyName(prop)),
          getStringWithSubstitutedValues(substitutionMap, value)
        ]),
      styleTuples
    )
  );

const variableRuleGenerator = (path, substitutionMap) => rule =>
  t.objectExpression([
    ...baseRuleElements(rule),
    ..._.flow(
      _.pick(["exportedVariables", "transitionParts", "animationParts"]),
      jsonObjectProperties
    )(rule),
    t.objectProperty(
      t.stringLiteral("styleTuples"),
      createStyleTuples(substitutionMap, rule)
    )
  ]);

const staticRuleGenerator = (path, substitutionMap) => {
  let i = 0;
  const getStyleSheetReference = () => {
    const value = i;
    i += 1;
    return t.numericLiteral(value);
  };

  const statementPath = path.getStatementParent();
  const styleSheetReference = statementPath.scope.generateUidIdentifier(
    "csstaStyle"
  );

  let existingStyleSheetElement = null;
  const existingRuleBases = [];

  const addStyle = ruleBase => {
    if (!ruleBase.styleSheetReference) return;

    existingRuleBases.push(ruleBase);

    const reactNativeStyleSheetRef = getOrCreateImportReference(
      path,
      "react-native",
      "StyleSheet"
    );

    const styleSheetBody = t.objectExpression(
      _.map(
        rule => t.objectProperty(rule.styleSheetReference, rule.styleBody),
        existingRuleBases
      )
    );

    const styleSheetElement = t.variableDeclaration("var", [
      t.variableDeclarator(
        styleSheetReference,
        t.callExpression(
          t.memberExpression(reactNativeStyleSheetRef, t.identifier("create")),
          [styleSheetBody]
        )
      )
    ]);

    if (existingStyleSheetElement) {
      existingStyleSheetElement.replaceWith(styleSheetElement);
    } else {
      statementPath.insertBefore(styleSheetElement);
      existingStyleSheetElement = statementPath.getPrevSibling();
    }
  };

  return rule => {
    const styleBody = createStyleBody(
      statementPath,
      substitutionMap,
      rule.styleTuples
    );

    const ruleBase = _.flow(
      _.set("styleBody", styleBody),
      _.set("styleSheetReference", styleBody ? getStyleSheetReference() : null)
    )(rule);

    addStyle(ruleBase);

    const ruleBody = t.objectExpression([
      ...baseRuleElements(ruleBase),
      ...jsonObjectProperties({
        transitions: ruleBase.transitionParts,
        animation: ruleBase.animationParts
      }),
      t.objectProperty(
        t.stringLiteral("style"),
        ruleBase.styleSheetReference
          ? t.memberExpression(
              styleSheetReference,
              ruleBase.styleSheetReference,
              true
            )
          : t.nullLiteral()
      )
    ]);

    return ruleBody;
  };
};

const styleTupleIsStatic = _.negate(styleTupleHasVariable);
const styleIsStatic = _.negate(styleHasVariable);

const ruleIsStatic = _.conforms({
  styleTuples: _.every(styleTupleIsStatic),
  exportedVariables: _.isEmpty,
  transitionParts: _.every(styleIsStatic),
  animationParts: styleIsStatic
});

module.exports = (path, substitutionMap, rules) => {
  const createStaticRule = staticRuleGenerator(path, substitutionMap);
  const createVariableRule = variableRuleGenerator(path, substitutionMap);

  return t.arrayExpression(
    _.map(
      rule =>
        ruleIsStatic(rule) ? createStaticRule(rule) : createVariableRule(rule),
      rules
    )
  );
};

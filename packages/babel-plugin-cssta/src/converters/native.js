/* eslint-disable no-param-reassign */
const t = require('babel-types');
const { parse } = require('babylon');
const _ = require('lodash/fp');
const { getValidatorSourceForSelector } = require('cssta/src/native/selectorTransform');
const resolveVariableDependencies = require('cssta/src/util/resolveVariableDependencies');
const extractRules = require('cssta/src/native/extractRules');
const { default: cssToReactNative, getPropertyName } = require('css-to-react-native');
const {
  getOrCreateImportReference, jsonToNode, containsSubstitution, getSubstitutionRegExp,
} = require('../util');

const SIMPLE_OR_NO_INTERPOLATION = 0;
const TEMPLATE_INTERPOLATION = 1;

const createValidatorNodeForSelector = selector =>
  parse(getValidatorSourceForSelector(selector)).program.body[0].expression;

const convertValue = transform => (path, value) =>
  t.callExpression(t.identifier(transform), [value]);

const stringInterpolation = (path, value) =>
  t.callExpression(t.memberExpression(convertValue('String')(path, value), t.identifier('trim')), []);

const lengthInterpolation = (path, value) => {
  const transformRawValue = getOrCreateImportReference(
    path,
    'cssta/dist/packages/css-to-react-native',
    'transformRawValue'
  );

  return t.callExpression(transformRawValue, [value]);
};

const numberInterpolation = convertValue('Number');

/*
All the values we can work out easily.

E.g.
fontSize: ${value} can only be a number -> { fontSize: Number(value) }
position: ${value} can only be a string -> { position: String(value).trim() }

Some values, like 'margin', have shorthands, so cannot be included.
*/
const simpleInterpolation = {
  /* View */
  backfaceVisibility: stringInterpolation,
  background: stringInterpolation,
  backgroundColor: stringInterpolation,
  borderBottomColor: stringInterpolation,
  borderBottomLeftRadius: lengthInterpolation,
  borderBottomRightRadius: lengthInterpolation,
  borderBottomWidth: lengthInterpolation,
  borderLeftColor: stringInterpolation,
  borderLeftWidth: lengthInterpolation,
  borderRightColor: stringInterpolation,
  borderRightWidth: lengthInterpolation,
  borderTopColor: stringInterpolation,
  borderTopLeftRadius: lengthInterpolation,
  borderTopRightRadius: lengthInterpolation,
  borderTopWidth: lengthInterpolation,
  opacity: numberInterpolation,
  elevation: numberInterpolation,
  /* Layout */
  alignItems: stringInterpolation,
  alignSelf: stringInterpolation,
  bottom: lengthInterpolation,
  flexBasis: lengthInterpolation,
  flexDirection: stringInterpolation,
  flexGrow: numberInterpolation,
  flexShrink: numberInterpolation,
  flexWrap: stringInterpolation,
  height: lengthInterpolation,
  justifyContent: stringInterpolation,
  left: lengthInterpolation,
  marginBottomWidth: lengthInterpolation,
  marginLeftWidth: lengthInterpolation,
  marginRightWidth: lengthInterpolation,
  marginTopWidth: lengthInterpolation,
  maxHeight: lengthInterpolation,
  maxWidth: lengthInterpolation,
  minHeight: lengthInterpolation,
  minWidth: lengthInterpolation,
  overflow: stringInterpolation,
  paddingBottomWidth: lengthInterpolation,
  paddingLeftWidth: lengthInterpolation,
  paddingRightWidth: lengthInterpolation,
  paddingTopWidth: lengthInterpolation,
  position: stringInterpolation,
  right: lengthInterpolation,
  top: lengthInterpolation,
  width: lengthInterpolation,
  zIndex: numberInterpolation,
  /* Text */
  color: stringInterpolation,
  fontSize: lengthInterpolation,
  fontStyle: stringInterpolation,
  fontWeight: stringInterpolation,
  lineHeight: lengthInterpolation,
  textAlign: stringInterpolation,
  textDecorationLine: stringInterpolation,
  textShadowColor: stringInterpolation,
  textShadowRadius: lengthInterpolation,
  textAlignVertical: stringInterpolation,
  letterSpacing: lengthInterpolation,
  textDecorationColor: stringInterpolation,
  textDecorationStyle: stringInterpolation,
  writingDirection: stringInterpolation,
};

const getInterpolationType = (substitutionMap, [prop, value]) => {
  if (!containsSubstitution(substitutionMap, value)) {
    return SIMPLE_OR_NO_INTERPOLATION;
  } else if (getPropertyName(prop) in simpleInterpolation) {
    return SIMPLE_OR_NO_INTERPOLATION;
  }
  return TEMPLATE_INTERPOLATION;
};

const getTemplateValues = cooked => ({
  cooked,
  raw: JSON.stringify(cooked).slice(1, -1),
});

const getStringWithSubstitutedValues = (substitutionMap, value) => {
  /* Don't attempt to optimise `${value}`: it converts to a string and we need that */
  const allValues = !_.isEmpty(substitutionMap)
    ? _.chunk(2, value.split(getSubstitutionRegExp(substitutionMap)))
    : [[value]];
  const quasiValues = _.map(0, allValues);
  const expressionValues = _.dropLast(1, _.map(1, allValues));

  if (_.isEmpty(expressionValues)) return t.stringLiteral(quasiValues[0]);

  const quasis = [].concat(
    _.map(cooked => t.templateElement(getTemplateValues(cooked)), _.initial(quasiValues)),
    t.templateElement(getTemplateValues(_.last(quasiValues)), true)
  );
  const expressions = _.map(_.propertyOf(substitutionMap), expressionValues);

  return t.templateLiteral(quasis, expressions);
};

const createStyleSheetBody = _.curry((path, substitutionMap, rule) => {
  const styleGroups = _.reduce((groups, styleTuple) => {
    const interpolationType = getInterpolationType(substitutionMap, styleTuple);
    const lastGroup = _.last(groups);

    if (_.get('interpolationType', lastGroup) === interpolationType) {
      lastGroup.styleTuples.push(styleTuple);
    } else {
      groups.push({ interpolationType, styleTuples: [styleTuple] });
    }

    return groups;
  }, [], rule.styleTuples);

  const transformedGroups = _.map(({ styleTuples, interpolationType }) => {
    if (interpolationType === SIMPLE_OR_NO_INTERPOLATION) {
      const substitutionRegExp = !_.isEmpty(substitutionMap)
        ? getSubstitutionRegExp(substitutionMap)
        : null;

      const styleMap = _.reduce((accum, [prop, value]) => {
        const propertyName = getPropertyName(prop);
        const substitutionMatches = substitutionRegExp
          ? value.match(substitutionRegExp)
          : null;

        if (!substitutionMatches) {
          const styles = cssToReactNative([[propertyName, value]]);
          const styleToValue = _.mapValues(jsonToNode, styles);
          return _.assign(accum, styleToValue);
        } else if (substitutionMatches.length === 1) {
          const substitutionNode = substitutionMatches[0] === value.trim()
            ? substitutionMap[value]
            : getStringWithSubstitutedValues(substitutionMap, value);

          return _.set(
            propertyName,
            simpleInterpolation[propertyName](path, substitutionNode),
            accum
          );
        }

        throw new Error(`Used multiple values ${propertyName}, which accepts one value`);
      }, {}, styleTuples);

      return t.objectExpression(_.map(([key, value]) => (
        t.objectProperty(t.stringLiteral(key), value)
      ), _.toPairs(styleMap)));
    }

    const cssToReactNativeReference = getOrCreateImportReference(
      path,
      'cssta/dist/packages/css-to-react-native',
      'default'
    );

    const bodyPairs = t.arrayExpression(_.map(([prop, value]) => t.arrayExpression([
      t.stringLiteral(getPropertyName(prop)),
      getStringWithSubstitutedValues(substitutionMap, value),
    ]), styleTuples));

    return t.callExpression(cssToReactNativeReference, [bodyPairs]);
  }, styleGroups);

  if (_.isEmpty(transformedGroups)) {
    return null;
  } else if (transformedGroups.length === 1) {
    return transformedGroups[0];
  }
  return t.callExpression(
    t.memberExpression(t.identifier('Object'), t.identifier('assign')),
    transformedGroups
  );
});

const baseRuleElements = rule => [
  t.objectProperty(
    t.stringLiteral('validate'),
    createValidatorNodeForSelector(rule.selector)
  ),
  t.objectProperty(
    t.stringLiteral('transitions'),
    jsonToNode(rule.transitions)
  ),
  t.objectProperty(
    t.stringLiteral('exportedVariables'),
    jsonToNode(rule.exportedVariables)
  ),
];

const createStaticStylesheet = (
  path,
  component,
  substitutionMap,
  rules
) => {
  const statementPath = path.getStatementParent();
  const styleSheetReference = statementPath.scope.generateUidIdentifier('csstaStyle');

  let i = 0;
  const getStyleSheetReference = () => {
    const value = i;
    i += 1;
    return t.numericLiteral(value);
  };

  const createStyleBodyForRule = createStyleSheetBody(statementPath, substitutionMap);
  const ruleBases = _.flow(
    _.map(rule => _.set('styleBody', createStyleBodyForRule(rule), rule)),
    _.filter(rule => rule.styleBody),
    _.map(_.update('styleSheetReference', getStyleSheetReference))
  )(rules);

  const rulesBody = t.arrayExpression(_.map(rule => t.objectExpression([
    ...baseRuleElements(rule),
    t.objectProperty(
      t.stringLiteral('style'),
      t.memberExpression(styleSheetReference, rule.styleSheetReference, true)
    ),
  ]), ruleBases));

  if (!_.isEmpty(ruleBases)) {
    const reactNativeStyleSheetRef =
      getOrCreateImportReference(path, 'react-native', 'StyleSheet');

    const styleSheetBody = t.objectExpression(_.map(rule => t.objectProperty(
      rule.styleSheetReference,
      rule.styleBody
    ), ruleBases));

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

const createVariablesStyleSheet = (
  path,
  component,
  substitutionMap,
  rules
) => {
  const createStyleTuples = ({ styleTuples }) => t.arrayExpression(_.map(([prop, value]) => (
    t.arrayExpression([
      t.stringLiteral(getPropertyName(prop)),
      getStringWithSubstitutedValues(substitutionMap, value),
    ])
  ), styleTuples));

  const rulesBody = t.arrayExpression(_.map(rule => t.objectExpression([
    ...baseRuleElements(rule),
    t.objectProperty(
      t.stringLiteral('styleTuples'),
      createStyleTuples(rule)
    ),
  ]), rules));

  return rulesBody;
};

module.exports = (path, state, component, cssText, substitutionMap) => {
  const { rules, propTypes, managerArgs } = extractRules(cssText);
  const exportedVariables = _.reduce(_.assign, {}, _.map('exportedVariables', rules));
  const exportsVariables = !_.isEmpty(exportedVariables);

  const { singleSourceOfVariables } = state;
  const resolvedVariables = (singleSourceOfVariables && exportsVariables)
    ? resolveVariableDependencies(exportedVariables, {})
    : null;
  if (resolvedVariables && !_.isEqual(resolvedVariables, singleSourceOfVariables)) {
    throw new Error('When using singleSourceOfVariables, only one component can define variables');
  }

  const hasVariables = !_.isEmpty(managerArgs.importedVariables) || !_.isEmpty(exportedVariables);
  const hasTransitions = !_.isEmpty(managerArgs.transitions);

  const enhancersRoot = 'cssta/dist/native/dynamicComponentEnhancers';
  const enhancers = [];
  let rulesBody;

  if (singleSourceOfVariables || !hasVariables) {
    rulesBody = createStaticStylesheet(path, component, substitutionMap, rules);
  } else {
    const variablesEnhancer =
      getOrCreateImportReference(path, `${enhancersRoot}/VariablesStyleSheetManager`, 'default');
    enhancers.push(variablesEnhancer);

    rulesBody = createVariablesStyleSheet(path, component, substitutionMap, rules);
  }

  if (hasTransitions) {
    const transitionEnhancer =
      getOrCreateImportReference(path, `${enhancersRoot}/Transition`, 'default');
    enhancers.push(transitionEnhancer);
  }

  let newElement;

  const componentRoot = 'cssta/dist/native';
  if (_.isEmpty(enhancers)) {
    const staticComponent =
      getOrCreateImportReference(path, `${componentRoot}/staticComponent`, 'default');

    newElement = t.callExpression(staticComponent, [
      component,
      jsonToNode(Object.keys(propTypes)),
      rulesBody,
    ]);
  } else {
    const dynamicComponent =
      getOrCreateImportReference(path, `${componentRoot}/dynamicComponent`, 'default');

    const managerArgsNode = t.objectExpression([].concat(
      t.objectProperty(t.stringLiteral('rules'), rulesBody),
      _.map(([key, value]) => (
        t.objectProperty(t.stringLiteral(key), jsonToNode(value))
      ), _.toPairs(managerArgs))
    ));

    newElement = t.callExpression(dynamicComponent, [
      component,
      jsonToNode(Object.keys(propTypes)),
      t.arrayExpression(enhancers),
      managerArgsNode,
    ]);
  }

  path.replaceWith(newElement);
};

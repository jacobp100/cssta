/* eslint-disable no-param-reassign */
const t = require('babel-types');
const { parse } = require('babylon');
const _ = require('lodash/fp');
const { getValidatorSourceForSelector } = require('cssta/src/native/selectorTransform');
const extractRules = require('cssta/src/native/extractRules');
const { default: cssToReactNative, getPropertyName } = require('css-to-react-native');
const { getOrCreateImportReference, jsonToNode } = require('../util');

const SIMPLE_OR_NO_INTERPOLATION = 0;
const TEMPLATE_INTERPOLATION = 1;

const convertValue = transform => value => t.callExpression(t.identifier(transform), [value]);

const createValidatorNodeForSelector = selector =>
  parse(getValidatorSourceForSelector(selector)).program.body[0].expression;

const stringInterpolation = value =>
  t.callExpression(t.memberExpression(convertValue('String')(value), t.identifier('trim')), []);

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
  borderBottomLeftRadius: numberInterpolation,
  borderBottomRightRadius: numberInterpolation,
  borderBottomWidth: numberInterpolation,
  borderLeftColor: stringInterpolation,
  borderLeftWidth: numberInterpolation,
  borderRightColor: stringInterpolation,
  borderRightWidth: numberInterpolation,
  borderTopColor: stringInterpolation,
  borderTopLeftRadius: numberInterpolation,
  borderTopRightRadius: numberInterpolation,
  borderTopWidth: numberInterpolation,
  opacity: numberInterpolation,
  elevation: numberInterpolation,
  /* Layout */
  alignItems: stringInterpolation,
  alignSelf: stringInterpolation,
  bottom: numberInterpolation,
  flexBasis: numberInterpolation,
  flexDirection: stringInterpolation,
  flexGrow: numberInterpolation,
  flexShrink: numberInterpolation,
  flexWrap: stringInterpolation,
  height: numberInterpolation,
  justifyContent: stringInterpolation,
  left: numberInterpolation,
  marginBottomWidth: numberInterpolation,
  marginLeftWidth: numberInterpolation,
  marginRightWidth: numberInterpolation,
  marginTopWidth: numberInterpolation,
  maxHeight: numberInterpolation,
  maxWidth: numberInterpolation,
  minHeight: numberInterpolation,
  minWidth: numberInterpolation,
  overflow: stringInterpolation,
  paddingBottomWidth: numberInterpolation,
  paddingLeftWidth: numberInterpolation,
  paddingRightWidth: numberInterpolation,
  paddingTopWidth: numberInterpolation,
  position: stringInterpolation,
  right: numberInterpolation,
  top: numberInterpolation,
  width: numberInterpolation,
  zIndex: numberInterpolation,
  /* Text */
  color: stringInterpolation,
  fontFamily: stringInterpolation, // Safe, since quotes aren't used for this
  fontSize: numberInterpolation,
  fontStyle: stringInterpolation,
  fontWeight: stringInterpolation,
  lineHeight: numberInterpolation,
  textAlign: stringInterpolation,
  textDecorationLine: stringInterpolation,
  textShadowColor: stringInterpolation,
  textShadowRadius: numberInterpolation,
  textAlignVertical: stringInterpolation,
  letterSpacing: numberInterpolation,
  textDecorationColor: stringInterpolation,
  textDecorationStyle: stringInterpolation,
  writingDirection: stringInterpolation,
};

const getSubstitutionRegExp = (substitutionMap) => {
  const substititionNames = Object.keys(substitutionMap);
  const substitionNamesRegExp = new RegExp(`(${substititionNames.join('|')})`, 'g');
  return substitionNamesRegExp;
};

const containsSubstitution = (substitutionMap, value) =>
  !_.isEmpty(substitutionMap) && getSubstitutionRegExp(substitutionMap).test(value);

const getInterpolationType = (substitutionMap, [prop, value]) => {
  if (!containsSubstitution(substitutionMap, value)) {
    return SIMPLE_OR_NO_INTERPOLATION;
  } else if (getPropertyName(prop) in simpleInterpolation) {
    return SIMPLE_OR_NO_INTERPOLATION;
  }
  return TEMPLATE_INTERPOLATION;
};

const getStringWithSubstitutedValues = (substitutionMap, value) => {
  /* Don't attempt to optimise `${value}`: it converts to a string and we need that */
  const allValues = !_.isEmpty(substitutionMap)
    ? _.chunk(2, value.split(getSubstitutionRegExp(substitutionMap)))
    : [[value]];
  const quasiValues = _.map(0, allValues);
  const expressionValues = _.dropLast(1, _.map(1, allValues));

  if (_.isEmpty(expressionValues)) return t.stringLiteral(quasiValues[0]);

  const quasis = [].concat(
    _.map(raw => t.templateElement({ raw }), _.initial(quasiValues)),
    t.templateElement({ raw: _.last(quasiValues) }, true)
  );
  const expressions = _.map(_.propertyOf(substitutionMap), expressionValues);

  return t.templateLiteral(quasis, expressions);
};

const createStyleSheetBody = (element, state, substitutionMap) => (rule) => {
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
      const styleMap = _.reduce((accum, [prop, value]) => {
        const propertyName = getPropertyName(prop);
        const substitution = substitutionMap[value.trim()];

        if (substitution) {
          return _.set(propertyName, simpleInterpolation[propertyName](substitution), accum);
        } else if (!containsSubstitution(value)) {
          const styles = cssToReactNative([[propertyName, value]]);
          const styleToValue = _.mapValues(jsonToNode, styles);
          return _.assign(accum, styleToValue);
        }

        throw new Error(`Used multiple values ${propertyName}, which accepts one value`);
      }, {}, styleTuples);

      return t.objectExpression(_.map(([key, value]) => (
        t.objectProperty(t.stringLiteral(key), value)
      ), _.toPairs(styleMap)));
    }

    const cssToReactNativeReference = getOrCreateImportReference(
      element,
      state,
      'css-to-react-native',
      'default'
    );

    const bodyPairs = t.arrayExpression(_.map(([prop, value]) => t.arrayExpression([
      t.stringLiteral(getPropertyName(prop)),
      getStringWithSubstitutedValues(substitutionMap, value),
    ]), styleTuples));

    return t.callExpression(cssToReactNativeReference, [bodyPairs]);
  }, styleGroups);

  return (transformedGroups.length === 1)
    ? transformedGroups[0]
    : t.callExpression(
      t.memberExpression(t.identifier('Object'), t.identifier('assign')),
      transformedGroups
    );
};

const createStaticStyleSheet = (
  element,
  state,
  substitutionMap,
  component,
  rules,
  propTypes
) => {
  let i = 0;
  const getStyleName = () => {
    const value = i;
    i += 1;
    return value;
  };

  const styleSheetReference = element.scope.generateUidIdentifier('csstaStyle');

  const styleNames = _.map(getStyleName, rules);
  const styleBodies = _.map(createStyleSheetBody(element, state, substitutionMap), rules);

  const styleSheetBody = t.objectExpression(_.map(([styleName, body]) => (
    t.objectProperty(t.numericLiteral(styleName), body)
  ), _.zip(styleNames, styleBodies)));

  const rulesBody = t.arrayExpression(_.map(([styleName, { selector }]) => t.objectExpression([
    t.objectProperty(
      t.stringLiteral('validate'),
      createValidatorNodeForSelector(selector)
    ),
    t.objectProperty(
      t.stringLiteral('style'),
      t.memberExpression(styleSheetReference, t.numericLiteral(styleName), true)
    ),
  ]), _.zip(styleNames, rules)));

  const staticComponent = getOrCreateImportReference(
    element,
    state,
    'cssta/dist/native/staticComponent',
    'default'
  );
  const newElement = t.callExpression(staticComponent, [
    component,
    jsonToNode(Object.keys(propTypes)),
    rulesBody,
  ]);

  element.replaceWith(newElement);

  const reactNativeStyleSheetRef = getOrCreateImportReference(
    element,
    state,
    'react-native',
    'StyleSheet'
  );

  const styleSheetElement = t.variableDeclaration('var', [
    t.variableDeclarator(styleSheetReference, t.callExpression(
      t.memberExpression(reactNativeStyleSheetRef, t.identifier('create')),
      [styleSheetBody]
    )),
  ]);

  element.insertBefore(styleSheetElement);
};

const createDynamicStylesheet = (
  element,
  state,
  substitutionMap,
  component,
  rules,
  propTypes,
  importedVariables
) => {
  const createStyleTuples = ({ styleTuples }) => t.arrayExpression(_.map(([prop, value]) => (
    t.arrayExpression([
      t.stringLiteral(getPropertyName(prop)),
      getStringWithSubstitutedValues(substitutionMap, value),
    ])
  ), styleTuples));

  const rulesBody = t.arrayExpression(_.map(rule => t.objectExpression([
    t.objectProperty(
      t.stringLiteral('validate'),
      createValidatorNodeForSelector(rule.selector)
    ),
    t.objectProperty(
      t.stringLiteral('styleTuples'),
      createStyleTuples(rule)
    ),
    t.objectProperty(
      t.stringLiteral('exportedVariables'),
      jsonToNode(rule.exportedVariables)
    ),
  ]), rules));

  const dynamicComponent = getOrCreateImportReference(
    element,
    state,
    'cssta/dist/native/dynamicComponent',
    'default'
  );

  const newElement = t.callExpression(dynamicComponent, [
    component,
    jsonToNode(Object.keys(propTypes)),
    jsonToNode(importedVariables),
    rulesBody,
  ]);

  element.replaceWith(newElement);
};

module.exports = (element, state, component, cssText, substitutionMap) => {
  const { rules, propTypes, importedVariables } = extractRules(cssText);
  const exportsVariables =
    !state.singleSourceVariables && _.some(rule => !_.isEmpty(rule.exportedVariables), rules);

  const baseParams = [element, state, substitutionMap, component, rules, propTypes];
  if (!exportsVariables && _.isEmpty(importedVariables)) {
    createStaticStyleSheet(...baseParams);
  } else {
    createDynamicStylesheet(...baseParams, importedVariables);
  }
};

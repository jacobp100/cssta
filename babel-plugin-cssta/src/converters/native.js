/* eslint-disable no-param-reassign */
const t = require('babel-types');
const { parse } = require('babylon');
const _ = require('lodash/fp');
const { getValidatorSourceForSelector } = require('cssta/src/native/selectorTransform');
const getRoot = require('cssta/src/util/getRoot');
const {
  default: cssToReactNative, getPropertyName,
} = require('css-to-react-native');
const { getOrCreateImportReference, jsonToNode } = require('../util');

const varRegExp = /var\s*\(\s*--([_a-z0-9-]+)\s*(?:,\s*([^)]+))?\)/ig;
const varRegExpNonGlobal = /var\s*\(\s*--([_a-z0-9-]+)\s*(?:,\s*([^)]+))?\)/i;
const isVariableDecl = decl => /^--/.test(decl.prop);

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

const getInterpolationType = (substitutionMap, decl) => {
  const { value, prop } = decl;
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

const createStyleSheetBody = (element, state, substitutionMap) => ({ styleDecls }) => {
  const styleGroups = _.reduce((groups, decl) => {
    const interpolationType = getInterpolationType(substitutionMap, decl);
    const lastGroup = _.last(groups);

    if (_.get('interpolationType', lastGroup) === interpolationType) {
      lastGroup.decls.push(decl);
    } else {
      groups.push({ interpolationType, decls: [decl] });
    }

    return groups;
  }, [], styleDecls);

  const transformedGroups = _.map(({ decls, interpolationType }) => {
    if (interpolationType === SIMPLE_OR_NO_INTERPOLATION) {
      const styleMap = _.reduce((accum, decl) => {
        const propertyName = getPropertyName(decl.prop);
        const substitution = substitutionMap[decl.value.trim()];

        if (substitution) {
          return _.set(propertyName, simpleInterpolation[propertyName](substitution), accum);
        } else if (!containsSubstitution(decl.value)) {
          const styles = cssToReactNative([[propertyName, decl.value]]);
          const styleToValue = _.mapValues(jsonToNode, styles);
          return _.assign(accum, styleToValue);
        }

        throw new Error(`Used multiple values ${propertyName}, which accepts one value`);
      }, {}, decls);

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

    const bodyPairs = t.arrayExpression(_.map(decl => t.arrayExpression([
      t.stringLiteral(getPropertyName(decl.prop)),
      getStringWithSubstitutedValues(substitutionMap, decl.value),
    ]), decls));

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
  ruleBodies,
  propTypes
) => {
  let i = 0;
  const getStyleName = () => {
    const value = i;
    i += 1;
    return value;
  };

  const styleSheetReference = element.scope.generateUidIdentifier('csstaStyle');

  const styleNames = _.map(getStyleName, ruleBodies);
  const styleBodies = _.map(createStyleSheetBody(element, state, substitutionMap), ruleBodies);

  const styleSheetBody = t.objectExpression(_.map(([styleName, body]) => (
    t.objectProperty(t.numericLiteral(styleName), body)
  ), _.zip(styleNames, styleBodies)));

  const rules = t.arrayExpression(_.map(([styleName, { selector }]) => t.objectExpression([
    t.objectProperty(
      t.stringLiteral('validate'),
      createValidatorNodeForSelector(selector)
    ),
    t.objectProperty(
      t.stringLiteral('style'),
      t.memberExpression(styleSheetReference, t.numericLiteral(styleName), true)
    ),
  ]), _.zip(styleNames, ruleBodies)));

  const staticComponent = getOrCreateImportReference(
    element,
    state,
    'cssta/dist/native/staticComponent',
    'default'
  );
  const newElement = t.callExpression(staticComponent, [
    component,
    jsonToNode(Object.keys(propTypes)),
    rules,
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
  ruleBodies,
  propTypes,
  importedVariables
) => {
  const createStyleTuples = ({ styleDecls }) => t.arrayExpression(_.map(styleDecl => (
    t.arrayExpression([
      t.stringLiteral(getPropertyName(styleDecl.prop)),
      getStringWithSubstitutedValues(substitutionMap, styleDecl.value),
    ])
  ), styleDecls));

  const rules = t.arrayExpression(_.map(rule => t.objectExpression([
    t.objectProperty(
      t.stringLiteral('validate'),
      createValidatorNodeForSelector(rule.selector)
    ),
    t.objectProperty(
      t.stringLiteral('styleTuples'),
      createStyleTuples(rule)
    ),
    t.objectProperty(
      t.stringLiteral('variables'),
      jsonToNode(rule.variables)
    ),
  ]), ruleBodies));

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
    rules,
  ]);

  element.replaceWith(newElement);
};

const extractRules = (element, state, inputCss) => {
  const { root, propTypes } = getRoot(inputCss);

  const ruleNodes = [];
  root.walkRules((node) => {
    ruleNodes.push(node);
  });

  const ruleBodies = _.map(({ selector, nodes }) => {
    const allDecls = _.filter({ type: 'decl' }, nodes);
    const styleDecls = _.reject(isVariableDecl, allDecls);
    const variableDecls = _.filter(isVariableDecl, allDecls);

    const variables = _.flow(
      _.keyBy('prop'),
      _.mapValues('value'),
      _.mapKeys(key => key.substring(2))
    )(variableDecls);

    const importedVariables = _.flow(
      _.map('value'),
      _.flatMap(value => value.match(varRegExp)),
      _.compact,
      _.map(match => match.match(varRegExpNonGlobal)[1])
    )(styleDecls);

    return { selector, styleDecls, variables, importedVariables };
  }, ruleNodes);

  const importedVariables = _.flatMap('importedVariables', ruleBodies);
  const exportsVariables = _.some(ruleBody => !_.isEmpty(ruleBody.variables), ruleBodies);

  return { ruleBodies, propTypes, importedVariables, exportsVariables };
};

module.exports = (element, state, cssText, substitutionMap, component) => {
  const { ruleBodies, propTypes, importedVariables, exportsVariables } =
    extractRules(element, state, cssText);

  const baseParams = [element, state, substitutionMap, component, ruleBodies, propTypes];
  if (!exportsVariables && _.isEmpty(importedVariables)) {
    createStaticStyleSheet(...baseParams);
  } else {
    createDynamicStylesheet(...baseParams, importedVariables);
  }
};

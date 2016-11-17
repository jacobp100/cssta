/* eslint-disable no-param-reassign */
const t = require('babel-types');
const _ = require('lodash/fp');
const { createValidatorNodeForSelector } = require('cssta/src/native/selectorTransform');
const getRoot = require('cssta/src/util/getRoot');
const {
  default: cssToReactNative, getPropertyName,
} = require('css-to-react-native');
const { getOrCreateImportReference, jsonToNode } = require('../util');

const NO_INTERPOLATION = 0;
const SIMPLE_INTERPOLATION = 1;
const ADVANCED_INTERPOLATION = 2;

const simpleInterpolation = {
  color: 'String',
};

const extractRules = (element, state, inputCss, substitutionMap = {}) => {
  let i = 0;
  const getStyleName = () => {
    i += 1;
    return `style${i}`;
  };

  const substititionNames = Object.keys(substitutionMap);
  const substitionNamesRegExpNoCapture = new RegExp(`(?:${substititionNames.join('|')})`, 'g');
  const substitionNamesRegExp = new RegExp(`(${substititionNames.join('|')})`, 'g');

  const getInterpolationType = (decl) => {
    if (!_.some(value => _.includes(value, decl.value), substititionNames)) {
      return NO_INTERPOLATION;
    } else if (getPropertyName(decl.prop) in simpleInterpolation) {
      return SIMPLE_INTERPOLATION;
    }
    return ADVANCED_INTERPOLATION;
  };

  const getTemplateString = (value) => {
    /* Don't attempt to optimise `${value}`: it converts to a string and we need that */
    const quasiValues = value.split(substitionNamesRegExpNoCapture);
    const quasis = [].concat(
      _.map(raw => t.templateElement({ raw }), _.initial(quasiValues)),
      t.templateElement({ raw: _.last(quasiValues) }, true)
    );
    const expressions = _.map(
      _.propertyOf(substitutionMap),
      value.match(substitionNamesRegExp)
    );

    return t.templateLiteral(quasis, expressions);
  };

  const getBody = (nodes) => {
    const styleGroups = _.reduce((groups, node) => {
      if (node.type !== 'decl') return groups;

      const interpolationType = getInterpolationType(node);
      const lastGroup = _.last(groups);

      if (_.get('interpolationType', lastGroup) === interpolationType) {
        lastGroup.decls.push(node);
      } else {
        groups.push({ interpolationType, decls: [node] });
      }

      return groups;
    }, [], nodes);

    const transformedGroups = _.map(({ decls, interpolationType }) => {
      if (interpolationType === NO_INTERPOLATION) {
        return jsonToNode(cssToReactNative(_.map(decl => [decl.prop, decl.value], decls)));
      }

      if (interpolationType === SIMPLE_INTERPOLATION) {
        return t.objectExpression(_.map((decl) => {
          const propertyName = getPropertyName(decl.prop);
          const substitution = decl.value.match(substitionNamesRegExp)[0];

          return t.objectProperty(
            t.stringLiteral(propertyName),
            t.callExpression(
              t.identifier(simpleInterpolation[propertyName]),
              [substitutionMap[substitution]]
            )
          );
        }, decls));
      }

      const cssToReactNativeReference = getOrCreateImportReference(
        element,
        state,
        'css-to-react-native',
        'default'
      );

      const bodyPairs = t.arrayExpression(_.map(decl => t.arrayExpression([
        t.stringLiteral(getPropertyName(decl.prop)),
        getTemplateString(decl.value),
      ]), decls));

      return t.callExpression(cssToReactNativeReference, [bodyPairs]);
    }, styleGroups);

    if (transformedGroups.length === 1) return transformedGroups[0];

    return t.callExpression(
      t.memberExpression(t.identifier('Object'), t.identifier('assign')),
      transformedGroups
    );
  };

  const { root, propTypes } = getRoot(inputCss);

  const ruleNodes = [];
  root.walkRules((node) => {
    ruleNodes.push(node);
  });

  const stylesheetBodies = _.map(rule => getBody(rule.nodes), ruleNodes);

  return { ruleNodes, stylesheetBodies, propTypes };
};

module.exports = (element, state, cssText, substitutionMap, component) => {
  let i = 0;
  const getStyleName = () => {
    i += 1;
    return `style${i}`;
  };

  const filename = state.file.opts.filename;

  const { ruleNodes, stylesheetBodies, propTypes } =
    extractRules(element, state, cssText, substitutionMap);
  const styleSheetReference = element.scope.generateUidIdentifier('csstaStyle');

  const styleNames = _.map(getStyleName, ruleNodes);

  const styleSheetBody = t.objectExpression(_.map(([styleName, body]) => (
    t.objectProperty(t.stringLiteral(styleName), body)
  ), _.zip(styleNames, stylesheetBodies)));

  const rules = t.arrayExpression(_.map(([styleName, rule]) => t.objectExpression([
    t.objectProperty(
      t.stringLiteral('validator'),
      createValidatorNodeForSelector(rule.selector)
    ),
    t.objectProperty(
      t.stringLiteral('style'),
      t.memberExpression(styleSheetReference, t.stringLiteral(styleName), true)
    ),
  ]), _.zip(styleNames, ruleNodes)));

  const createComponent = state.createComponentReferences[filename].native;
  const newElement = t.callExpression(createComponent, [
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

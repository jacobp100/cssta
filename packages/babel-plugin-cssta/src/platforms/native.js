/* eslint-disable no-param-reassign */
const t = require('babel-types');
const { parse } = require('babylon');
const _ = require('lodash/fp');
const { getValidatorSourceForSelector } = require('cssta/src/native/selectorTransform');
const resolveVariableDependencies = require('cssta/src/util/resolveVariableDependencies');
const extractRules = require('cssta/src/native/extractRules');
const { transformStyleTuples } = require('cssta/src/native/cssUtil');
const { getPropertyName } = require('css-to-react-native');
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
    'cssta/lib/native/cssUtil',
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

const createStyleBody = _.curry((path, substitutionMap, styleTuples) => {
  const styleTupleGroups = _.reduce((groups, styleTuple) => {
    const interpolationType = getInterpolationType(substitutionMap, styleTuple);
    const lastGroup = _.last(groups);

    if (_.get('interpolationType', lastGroup) === interpolationType) {
      lastGroup.styleTuplesGroup.push(styleTuple);
    } else {
      groups.push({ interpolationType, styleTuplesGroup: [styleTuple] });
    }

    return groups;
  }, [], styleTuples);

  const transformedGroups = _.map(({ styleTuplesGroup, interpolationType }) => {
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
          const styles = transformStyleTuples([[propertyName, value]]);
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
      }, {}, styleTuplesGroup);

      return t.objectExpression(_.map(([key, value]) => (
        t.objectProperty(t.stringLiteral(key), value)
      ), _.toPairs(styleMap)));
    } else if (interpolationType === TEMPLATE_INTERPOLATION) {
      const cssToReactNativeReference = getOrCreateImportReference(
        path,
        'cssta/lib/native/cssUtil',
        'transformStyleTuples'
      );

      const bodyPairs = t.arrayExpression(_.map(([prop, value]) => t.arrayExpression([
        t.stringLiteral(getPropertyName(prop)),
        getStringWithSubstitutedValues(substitutionMap, value),
      ]), styleTuplesGroup));

      return t.callExpression(cssToReactNativeReference, [bodyPairs]);
    }
    throw new Error('No interpolation type specified');
  }, styleTupleGroups);

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

const jsonObjectProperties = _.flow(
  _.toPairs,
  _.map(([key, value]) => t.objectProperty(t.stringLiteral(key), jsonToNode(value)))
);

const baseRuleElements = rule => [
  t.objectProperty(
    t.stringLiteral('validate'),
    createValidatorNodeForSelector(rule.selector)
  ),
  ..._.flow(
    _.pick(['transitions', 'exportedVariables', 'animation']),
    jsonObjectProperties
  )(rule),
];

const createStaticStylesheet = (path, substitutionMap, rules) => {
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

const createVariablesStyleSheet = (path, substitutionMap, rules) => {
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

const commonArgsProperties = _.flow(
  _.pick(['transitionedProperties', 'importedVariables']),
  jsonObjectProperties
);

const commonProperties = (rulesBody, args) => [
  ...commonArgsProperties(args),
  t.objectProperty(t.stringLiteral('rules'), rulesBody),
];

const getStaticKeyframe = _.curry((path, substitutionMap, keyframe) => (
  t.objectExpression([
    t.objectProperty(
      t.stringLiteral('time'),
      t.numericLiteral(keyframe.time)
    ),
    t.objectProperty(
      t.stringLiteral('styles'),
      createStyleBody(path, substitutionMap, keyframe.styleTuples)
    ),
  ])
));

const getSaticKeyframes = (path, substitutionMap, keyframesStyleTuples) =>
  t.objectExpression(
    _.map(([keyframeName, styleTuples]) => t.objectProperty(
      t.stringLiteral(keyframeName),
      t.arrayExpression(_.map(getStaticKeyframe(path, substitutionMap), styleTuples))
    ), _.toPairs(keyframesStyleTuples))
  );

const createStaticArgs = (path, substitutionMap, rulesBody, args) =>
  t.objectExpression([
    ...commonProperties(rulesBody, args),
    t.objectProperty(
      t.stringLiteral('keyframes'),
      getSaticKeyframes(path, substitutionMap, args.keyframesStyleTuples)
    ),
  ]);

const createVariablesArgs = (path, substitutionMap, rulesBody, args) =>
  t.objectExpression([
    ...commonProperties(rulesBody, args),
    t.objectProperty(
      t.stringLiteral('keyframesStyleTuples'),
      jsonToNode(args.keyframesStyleTuples)
    ),
  ]);

const everyIsEmpty = _.every(_.isEmpty);
const ruleIsEmpty = _.flow(
  _.omit(['selector']),
  everyIsEmpty
);

module.exports = (path, state, component, cssText, substitutionMap) => {
  // eslint-disable-next-line
  let { rules, propTypes, args } = extractRules(cssText);
  const exportedVariables = _.reduce(_.assign, {}, _.map('exportedVariables', rules));
  const exportsVariables = !_.isEmpty(exportedVariables);

  const { singleSourceOfVariables } = state;
  const resolvedVariables = (singleSourceOfVariables && exportsVariables)
    ? resolveVariableDependencies(exportedVariables, {})
    : null;

  if (resolvedVariables && !_.isEqual(resolvedVariables, singleSourceOfVariables)) {
    throw new Error('When using singleSourceOfVariables, only one component can define variables');
  }

  // If we can globally remove configs from args/rules, do so here
  // Only do this for global configs so `args` has the same hidden class for each component
  const argsOmissions = [];
  const rulesOmissions = [];

  if (singleSourceOfVariables) {
    argsOmissions.push('importedVariables');
    rulesOmissions.push('exportedVariables');
  }

  args = _.omit(argsOmissions, args);
  rules = _.flow(
    _.map(_.omit(rulesOmissions)),
    _.reject(ruleIsEmpty)
  )(rules);

  // If we end up with nothing after removing configs, and we don't filter props,
  // we can just return the component
  if (everyIsEmpty(args) && _.isEmpty(rules) && _.isEmpty(propTypes)) {
    path.replaceWith(component);
    return;
  }

  const hasVariables =
    !singleSourceOfVariables &&
    (!_.isEmpty(args.importedVariables) || !_.isEmpty(exportedVariables));
  const hasKeyframes = !_.isEmpty(args.keyframesStyleTuples);
  const hasTransitions = !_.isEmpty(args.transitionedProperties);

  const componentRoot = 'cssta/lib/native';
  const enhancersRoot = `${componentRoot}/enhancers`;
  const enhancers = [];
  let rulesBody;

  if (hasVariables) {
    const variablesEnhancer =
      getOrCreateImportReference(path, `${enhancersRoot}/VariablesStyleSheetManager`, 'default');
    enhancers.push(variablesEnhancer);

    rulesBody = createVariablesStyleSheet(path, substitutionMap, rules, args);
  } else {
    rulesBody = createStaticStylesheet(path, substitutionMap, rules);
  }

  if (hasTransitions) {
    enhancers.push(getOrCreateImportReference(path, `${enhancersRoot}/Transition`, 'default'));
  }

  if (hasKeyframes) {
    enhancers.push(getOrCreateImportReference(path, `${enhancersRoot}/Animation`, 'default'));
  }

  let componentConstructor;
  if (_.isEmpty(enhancers)) {
    const createComponent =
      getOrCreateImportReference(path, `${componentRoot}/createComponent`, 'default');
    componentConstructor = createComponent;
  } else {
    const withEnhancers =
      getOrCreateImportReference(path, `${componentRoot}/withEnhancers`, 'default');
    componentConstructor = t.callExpression(withEnhancers, [
      t.arrayExpression(enhancers),
    ]);
  }

  const argsNode = hasVariables
    ? createVariablesArgs(path, substitutionMap, rulesBody, args)
    : createStaticArgs(path, substitutionMap, rulesBody, args);

  const newElement = t.callExpression(componentConstructor, [
    component,
    jsonToNode(Object.keys(propTypes)),
    argsNode,
  ]);

  path.replaceWith(newElement);
};

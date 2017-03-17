/* eslint-disable no-param-reassign */
const t = require('babel-types');
const _ = require('lodash/fp');
const resolveVariableDependencies = require('cssta/src/util/resolveVariableDependencies');
const extractRules = require('cssta/src/native/extractRules');
const { getOrCreateImportReference, jsonToNode } = require('../../util');
const createStyleSheetStatic = require('./createStyleSheetStatic');
const createStyleSheetVariables = require('./createStyleSheetVariables');
const createArgsStatic = require('./createArgsStatic');
const createArgsVariables = require('./createArgsVariables');


const everyIsEmpty = _.every(_.isEmpty);
const ruleIsEmpty = _.flow(
  _.omit(['selector']),
  everyIsEmpty
);

module.exports = (path, state, component, cssText, substitutionMap) => {
  // eslint-disable-next-line
  let { propTypes, args } = extractRules(cssText);
  const exportedVariables = _.reduce(_.assign, {}, _.map('exportedVariables', args.ruleTuples));
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

  args = _.flow(
    _.omit(argsOmissions),
    _.update('ruleTuples', _.flow(
      _.map(_.omit(rulesOmissions)),
      _.reject(ruleIsEmpty)
    ))
  )(args);

  // If we end up with nothing after removing configs, and we don't filter props,
  // we can just return the component
  if (everyIsEmpty(args) && _.isEmpty(propTypes)) {
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

    rulesBody = createStyleSheetVariables(path, substitutionMap, args.ruleTuples, args);
  } else {
    rulesBody = createStyleSheetStatic(path, substitutionMap, args.ruleTuples);
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
    ? createArgsVariables(path, substitutionMap, rulesBody, args)
    : createArgsStatic(path, substitutionMap, rulesBody, args);

  const newElement = t.callExpression(componentConstructor, [
    component,
    jsonToNode(Object.keys(propTypes)),
    argsNode,
  ]);

  path.replaceWith(newElement);
};

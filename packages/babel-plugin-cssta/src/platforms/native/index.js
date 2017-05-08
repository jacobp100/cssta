/* eslint-disable no-param-reassign */
const t = require('babel-types');
const _ = require('lodash/fp');
const resolveVariableDependencies = require('cssta/src/util/resolveVariableDependencies');
const extractRules = require('cssta/src/native/extractRules');
const { getOrCreateImportReference, jsonToNode } = require('../../util');
const createArgsStatic = require('./createArgsStatic');
const createArgsVariables = require('./createArgsVariables');


const everyIsEmpty = _.every(_.isEmpty);
const argsIsEmpty = _.flow(
  _.update('ruleTuples', _.map(_.omit(['selector']))),
  _.update('ruleTuples', _.reject(everyIsEmpty)),
  everyIsEmpty
);

module.exports = (path, state, component, cssText, substitutionMap) => {
  const { singleSourceOfVariables } = state;
  // eslint-disable-next-line
  let { propTypes, args } = extractRules(cssText);

  if (singleSourceOfVariables) {
    args = _.flow(
      _.set('importedVariables', []),
      _.update('ruleTuples', _.map(_.set('exportedVariables', {})))
    )(args);
  }

  const exportedVariables = _.reduce(_.assign, {}, _.map('exportedVariables', args.ruleTuples));
  const exportsVariables = !_.isEmpty(exportedVariables);

  const resolvedVariables = (singleSourceOfVariables && exportsVariables)
    ? resolveVariableDependencies(exportedVariables, {})
    : null;

  if (resolvedVariables && !_.isEqual(resolvedVariables, singleSourceOfVariables)) {
    throw new Error('When using singleSourceOfVariables, only one component can define variables');
  }

  // If we end up with nothing after removing configs, and we don't filter props,
  // we can just return the component
  if (argsIsEmpty(args) && _.isEmpty(propTypes)) {
    path.replaceWith(component);
    return;
  }

  const hasVariables =
    exportsVariables || !_.isEmpty(args.importedVariables) || !_.isEmpty(exportedVariables);

  if (hasVariables && singleSourceOfVariables) {
    throw new Error('Internal error: expected no variables with singleSourceOfVariables');
  }

  const componentRoot = 'cssta/lib/native';
  const enhancersRoot = `${componentRoot}/enhancers`;
  const enhancers = [];

  const addEnhancer = enhancer =>
    enhancers.push(getOrCreateImportReference(path, `${enhancersRoot}/${enhancer}`, 'default'));

  if (hasVariables) addEnhancer('VariablesStyleSheetManager');
  if (!_.isEmpty(args.transitionedProperties)) addEnhancer('Transition');
  if (!_.isEmpty(args.keyframesStyleTuples)) addEnhancer('Animation');

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
    ? createArgsVariables(path, substitutionMap, args)
    : createArgsStatic(path, substitutionMap, args);

  const newElement = t.callExpression(componentConstructor, [
    component,
    jsonToNode(Object.keys(propTypes)),
    argsNode,
  ]);

  path.replaceWith(newElement);
};

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
const argsIsEmpty = (args, singleSourceOfVariables) => {
  const argsOmissions = singleSourceOfVariables ? ['importedVariables'] : [];
  const ruleOmissions = singleSourceOfVariables ? ['exportedVariables'] : [];

  return _.flow(
    _.omit(argsOmissions),
    _.update('ruleTuples', _.map(_.omit(['selector', ...ruleOmissions]))),
    _.update('ruleTuples', _.reject(everyIsEmpty)),
    everyIsEmpty
  )(args);
};

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

  // If we end up with nothing after removing configs, and we don't filter props,
  // we can just return the component
  if (argsIsEmpty(args, singleSourceOfVariables) && _.isEmpty(propTypes)) {
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

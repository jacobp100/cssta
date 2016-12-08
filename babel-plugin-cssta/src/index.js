/* eslint-disable no-param-reassign */
const path = require('path');
const t = require('babel-types');
const _ = require('lodash/fp');
const { varRegExp } = require('cssta/dist/util');
const transformWebCssta = require('./converters/web');
const transformNativeCssta = require('./converters/native');
const removeSetPostCssPipeline = require('./optimizations/removeSetPostCssPipeline');
const singleSourceVariables = require('./optimizations/singleSourceVariables');
const { removeReference, getReferenceCountForImport } = require('./util');
const {
  getComponentAndReference, getCsstaTypeFromReference, interpolationTypes, extractCsstaCallParts,
} = require('./transformUtil');
const { getOptimisationOpts } = require('./util');

const canInterpolate = {
  web: false,
  native: true,
};

const transformCsstaTypes = {
  web: transformWebCssta,
  native: transformNativeCssta,
};

const transformCsstaCall = (element, state, node, stringArg) => {
  const componentAndReference = getComponentAndReference(element, state, node);
  if (!componentAndReference) return;

  const { reference, component } = componentAndReference;
  const csstaType = getCsstaTypeFromReference(element, state, reference);
  if (!csstaType) return;

  let interpolationType;
  const interpolateValuesOnly = Boolean(getOptimisationOpts(state, 'interpolateValuesOnly'));

  if (!canInterpolate[csstaType]) {
    interpolationType = interpolationTypes.DISALLOW;
  } else if (!interpolateValuesOnly) {
    interpolationType = interpolationTypes.IGNORE;
  } else {
    interpolationType = interpolationTypes.ALLOW;
  }

  const callParts = extractCsstaCallParts(stringArg, interpolationType);
  if (!callParts) return;

  let { cssText, substitutionMap } = callParts; // eslint-disable-line

  if (state.singleSourceVariables) {
    cssText = cssText.replace(varRegExp, (m, variableName, fallback) => (
      state.singleSourceVariables[variableName] || fallback
    ));
  }

  transformCsstaTypes[csstaType](element, state, component, cssText, substitutionMap);
  removeReference(state, reference);
};

const csstaModules = {
  cssta: 'web',
  'cssta/web': 'web',
  'cssta/native': 'native',
};

module.exports = () => ({
  visitor: {
    Program: {
      enter(element, state) {
        const singleSourceVariableOpts = getOptimisationOpts(state, 'singleSourceVariables');

        if (!state.singleSourceVariables && singleSourceVariableOpts) {
          const fileContainingVariables = path.join(process.cwd(), singleSourceVariableOpts.in);
          const exportedVariables = singleSourceVariables(fileContainingVariables, state.file.opts);
          state.singleSourceVariables = exportedVariables;
        }

        const filename = state.file.opts.filename;
        state.identifiersFromImportsPerFile = _.set(
          [filename],
          {},
          state.identifiersFromImportsPerFile
        );
        state.csstaReferenceTypesPerFile = _.set(
          [filename],
          {},
          state.csstaReferenceTypesPerFile
        );
      },
      exit(element, state) {
        const filename = state.file.opts.filename;
        const importLocals = _.flow(
          _.getOr({}, ['removedRefenceCountPerFile', filename]),
          _.keys
        )(state);
        const importElements = _.flow(
          _.map(_.propertyOf(state.identifiersFromImportsPerFile[filename])),
          _.uniq
        )(importLocals);

        _.forEach((importElement) => {
          importElement.node.specifiers = _.filter((specifier) => {
            const localName = specifier.local.name;
            return getReferenceCountForImport(state, localName) > 0;
          }, importElement.node.specifiers);

          if (_.isEmpty(importElement.node.specifiers)) {
            importElement.remove();
          }
        }, importElements);
      },
    },
    ImportDeclaration(element, state) {
      const moduleName = element.node.source.value;
      const specifiers = element.node.specifiers;

      const filename = state.file.opts.filename;

      _.forEach((specifier) => {
        let importedName;
        if (t.isImportSpecifier(specifier)) {
          importedName = specifier.imported.name;
        } else if (t.isImportDefaultSpecifier(specifier)) {
          importedName = 'default';
        }

        if (importedName) {
          state.importsPerFile = _.set(
            [filename, moduleName, importedName],
            specifier.local,
            state.importsPerFile
          );
          state.identifiersFromImportsPerFile = _.set(
            [filename, specifier.local.name],
            element,
            state.identifiersFromImportsPerFile
          );
        }
      }, specifiers);

      const csstaType = csstaModules[moduleName];
      if (!csstaType) return;

      const defaultSpecifiers = [].concat(
        _.filter({ type: 'ImportDefaultSpecifier' }, specifiers),
        _.filter({ type: 'ImportSpecifier', imported: { name: 'default' } }, specifiers)
      );
      if (_.isEmpty(defaultSpecifiers)) return;

      const specifierReferenceTypes = _.flow(
        _.map('local.name'),
        _.map(reference => [reference, csstaType]),
        _.fromPairs
      )(defaultSpecifiers);

      state.csstaReferenceTypesPerFile = _.update(
        [filename],
        _.assign(specifierReferenceTypes),
        state.csstaReferenceTypesPerFile || {}
      );
    },
    CallExpression(element, state) {
      const filename = state.file.opts.filename;
      const { node } = element;
      const { callee } = node;
      const [arg] = node.arguments;
      if (
        t.isMemberExpression(callee) &&
        _.get('property.name', callee) === 'setPostCssPipeline' &&
        _.get('object.name', callee) in state.csstaReferenceTypesPerFile[filename]
      ) {
        removeSetPostCssPipeline(element, state, node);
      } else {
        transformCsstaCall(element, state, callee, arg);
      }
    },
    TaggedTemplateExpression(element, state) {
      const { quasi, tag } = element.node;
      transformCsstaCall(element, state, tag, quasi);
    },
  },
});

module.exports.resetGenerators = transformWebCssta.resetGenerators;

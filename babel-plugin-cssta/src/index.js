/* eslint-disable no-param-reassign */
const path = require('path');
const t = require('babel-types');
const _ = require('lodash/fp');
const { varRegExp } = require('cssta/dist/util');
const transformWebCssta = require('./converters/web');
const transformNativeCssta = require('./converters/native');
const removeSetPostCssPipeline = require('./optimizations/removeSetPostCssPipeline');
const singleSourceOfVariables = require('./optimizations/singleSourceOfVariables');
const { removeReference, getReferenceCountForImport } = require('./util');
const {
  getCsstaReferences, interpolationTypes, extractCsstaCallParts,
} = require('./transformUtil/extractCsstaCallParts');
const { getCsstaTypeForCallee, recordImportReference, getOptimisationOpts } = require('./util');

const canInterpolate = {
  web: false,
  native: true,
};

const transformCsstaTypes = {
  web: transformWebCssta,
  native: transformNativeCssta,
};

const transformCsstaCall = (element, state, node, stringArg) => {
  const csstaReferenceParts = getCsstaReferences(element, state, node);
  if (!csstaReferenceParts) return;

  const { component, reference, csstaType } = csstaReferenceParts;

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

  if (state.singleSourceOfVariables) {
    cssText = cssText.replace(varRegExp, (m, variableName, fallback) => (
      state.singleSourceOfVariables[variableName] || fallback
    ));
  }

  transformCsstaTypes[csstaType](element, state, component, cssText, substitutionMap);
  removeReference(state, reference);
};


module.exports = () => ({
  visitor: {
    Program: {
      enter(element, state) {
        const singleSourceVariableOpts = getOptimisationOpts(state, 'singleSourceOfVariables');

        if (!state.singleSourceOfVariables && singleSourceVariableOpts) {
          if (!singleSourceVariableOpts.sourceFilename) {
            throw new Error(
              'You must provide `sourceFilename` in the options for singleSourceOfVariables'
            );
          }

          const fileContainingVariables = path.join(
            state.opts.cwd || process.cwd(),
            singleSourceVariableOpts.sourceFilename
          );
          const exportedVariables =
            singleSourceOfVariables(fileContainingVariables, state.file.opts);
          state.singleSourceOfVariables = exportedVariables;
        }

        const filename = state.file.opts.filename;
        state.identifiersFromImportsPerFile = _.set(
          [filename],
          {},
          state.identifiersFromImportsPerFile
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
      recordImportReference(element, state);
    },
    CallExpression(element, state) {
      const { node } = element;
      const { callee } = node;
      const [arg] = node.arguments;
      if (
        t.isMemberExpression(callee) &&
        _.get('property.name', callee) === 'setPostCssPipeline' &&
        getCsstaTypeForCallee(element, callee.object)
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

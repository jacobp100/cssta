/* eslint-disable no-param-reassign */
const p = require('path');
const t = require('babel-types');
const _ = require('lodash/fp');
const { varRegExp } = require('cssta/lib/util');
const transformWebCssta = require('./converters/web');
const transformNativeCssta = require('./converters/native');
const singleSourceOfVariables = require('./optimizations/singleSourceOfVariables');
const {
  getCsstaReferences, interpolationTypes, extractCsstaCallParts,
} = require('./transformUtil/extractCsstaCallParts');
const {
  csstaModules, getImportReferences, getCsstaTypeForCallee, getOptimisationOpts,
} = require('./util');

const canInterpolate = {
  web: false,
  native: true,
};

const transformCsstaTypes = {
  web: transformWebCssta,
  native: transformNativeCssta,
};

const redirectImports = {
  'cssta/native': {
    VariablesProvider: 'cssta/lib/native/VariablesProvider',
  },
};

const transformCsstaCall = (path, state, target, stringArg) => {
  const csstaReferenceParts = getCsstaReferences(path, target);
  if (!csstaReferenceParts) return;

  const { callee, component, csstaType } = csstaReferenceParts;

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

  transformCsstaTypes[csstaType](path, state, component, cssText, substitutionMap);
  const binding = path.scope.getBinding(callee.name);
  binding.dereference();
};


module.exports = () => ({
  visitor: {
    Program: {
      enter(path, state) {
        const singleSourceVariableOpts = !state.singleSourceOfVariables
          ? getOptimisationOpts(state, 'singleSourceOfVariables')
          : null;

        if (singleSourceVariableOpts && !singleSourceVariableOpts.sourceFilename) {
          throw new Error(
            'You must provide `sourceFilename` in the options for singleSourceOfVariables'
          );
        }

        if (singleSourceVariableOpts) {
          const fileContainingVariables = p.join(
            state.opts.cwd || process.cwd(),
            singleSourceVariableOpts.sourceFilename
          );
          const exportedVariables =
            singleSourceOfVariables(fileContainingVariables, state.file.opts);
          state.singleSourceOfVariables = exportedVariables;
        }
      },
      exit(path) {
        const unreferencedCsstaImportReferences = _.flow(
          _.flatMap(moduleName => getImportReferences(path, moduleName, 'default')),
          _.filter({ references: 0 })
        )(_.keys(csstaModules));

        _.forEach((reference) => {
          const importDeclaration = reference.path.findParent(t.isImportDeclaration);
          importDeclaration.remove();
        }, unreferencedCsstaImportReferences);
      },
    },
    ImportSpecifier(path) {
      const importName = path.node.imported.name;
      const importDeclaration = path.findParent(t.isImportDeclaration);
      const moduleName = importDeclaration.node.source.value;
      const redirect = _.get([moduleName, importName], redirectImports);
      if (!redirect) return;
      const redirectImport = t.importDeclaration([
        t.importDefaultSpecifier(path.node.local),
      ], t.stringLiteral(redirect));
      importDeclaration.insertBefore(redirectImport);

      if (importDeclaration.node.specifiers.length === 1) {
        importDeclaration.remove();
      } else {
        path.remove();
      }
    },
    CallExpression(path, state) {
      const { node } = path;
      const { callee } = node;
      const [arg] = node.arguments;
      transformCsstaCall(path, state, callee, arg);
    },
    TaggedTemplateExpression(path, state) {
      const { quasi, tag } = path.node;
      transformCsstaCall(path, state, tag, quasi);
    },
  },
});

module.exports.resetGenerators = transformWebCssta.resetGenerators;

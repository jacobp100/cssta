/* eslint-disable no-param-reassign */
const t = require('babel-types');
const _ = require('lodash/fp');
const transformWebCssta = require('./converters/web');
const transformNativeCssta = require('./converters/native');
const removeSetPostCssPipeline = require('./optimizations/removeSetPostCssPipeline');
const { hasOptimisation, removeReference, getReferenceCountForImport } = require('./util');

const transformCsstaTypes = {
  web: transformWebCssta,
  native: transformNativeCssta,
};

const canInterpolate = {
  web: false,
  native: true,
};

const csstaConstructorExpressionTypes = {
  CallExpression: element => [element.callee, element.arguments[0]],
  MemberExpression: element => [
    element.object,
    element.computed ? element.property : t.stringLiteral(element.property.name),
  ],
};

const transformCsstaCall = (element, state, node, stringArg) => {
  if (!(node.type in csstaConstructorExpressionTypes)) return;

  const [callee, component] = csstaConstructorExpressionTypes[node.type](node);

  if (!t.isIdentifier(callee)) return;

  const filename = state.file.opts.filename;
  const reference = callee.name;
  const csstaType = _.get([filename, reference], state.csstaReferenceTypesPerFile);

  if (!csstaType) return;

  const interpolateValuesOnly = hasOptimisation(state, 'interpolateValuesOnly');
  const hasInterpolation = t.isTemplateLiteral(stringArg) && !_.isEmpty(stringArg.expressions);

  if (hasInterpolation && !canInterpolate[csstaType]) {
    const ex = '`color: ${primary}`'; // eslint-disable-line
    throw new Error(`You cannot interpolation in template strings for ${csstaType} (i.e. ${ex})`);
  }

  let cssText = null;
  let substitutionMap = {};

  if (t.isTemplateLiteral(stringArg) && (!hasInterpolation || interpolateValuesOnly)) {
    const { quasis, expressions } = stringArg;
    const substitutionNames = expressions.map((value, index) => `__substitution-${index}__`);
    cssText =
      quasis[0].value.cooked +
      substitutionNames.map((name, index) => name + quasis[index + 1].value.cooked).join('');
    substitutionMap = _.fromPairs(_.zip(substitutionNames, expressions));
  } else if (t.isStringLiteral(stringArg)) {
    cssText = stringArg.value;
  }

  if (cssText !== null) {
    transformCsstaTypes[csstaType](element, state, cssText, substitutionMap, component);
    removeReference(state, reference);
  }
};

const csstaModules = {
  cssta: 'web',
  'cssta/web': 'web',
  'cssta/native': 'native',
};

module.exports = () => ({
  visitor: {
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
    Program: {
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
    CallExpression(element, state) {
      const filename = state.file.opts.filename;
      const { node } = element;
      const { callee } = node;
      const [arg] = node.arguments;
      if (t.isTemplateLiteral(arg) || t.isStringLiteral(arg)) {
        transformCsstaCall(element, state, callee, arg);
      } else if (
        t.isMemberExpression(callee) &&
        _.get('property.name', callee) === 'setPostCssPipeline' &&
        _.get('object.name', callee) in state.csstaReferenceTypesPerFile[filename]
      ) {
        removeSetPostCssPipeline(element, state, node);
      }
    },
    TaggedTemplateExpression(element, state) {
      const { quasi, tag } = element.node;
      transformCsstaCall(element, state, tag, quasi);
    },
  },
});

module.exports.resetGenerators = transformWebCssta.resetGenerators;

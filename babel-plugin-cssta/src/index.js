/* eslint-disable no-param-reassign */
const t = require('babel-types');
const _ = require('lodash/fp');
const transformWebCssta = require('./converters/web');
const transformNativeCssta = require('./converters/native');

const createComponentLocations = {
  web: 'cssta/lib/web/createComponent',
  native: 'cssta/lib/native/createComponent',
};

const csstaConstructorExpressionTypes = {
  CallExpression: element => [element.callee, element.arguments[0]],
  MemberExpression: element => [
    element.object,
    element.computed ? element.property : t.stringLiteral(element.property.name),
  ],
};

const jsonToNode = (object) => {
  if (typeof object === 'string') {
    return t.stringLiteral(object);
  } else if (Array.isArray(object)) {
    return t.arrayExpression(object.map(jsonToNode));
  }
  return t.objectExpression(Object.keys(object).map(key => (
    t.objectProperty(
      t.stringLiteral(key),
      jsonToNode(object[key])
    )
  )));
};

const transformCsstaCall = (element, state, node, stringArg) => {
  if (!(node.type in csstaConstructorExpressionTypes)) return;

  const [callee, component] = csstaConstructorExpressionTypes[node.type](node);

  if (!t.isIdentifier(callee)) return;

  const filename = state.file.opts.filename;
  const csstaType = _.get([filename, callee.name], state.csstaReferenceTypesPerFile);

  if (!csstaType) return;

  let cssText;
  let substitutionMap = {};

  if (t.isTemplateLiteral(stringArg)) {
    const { quasis, expressions } = stringArg;
    const substitutionNames = expressions.map((value, index) => `__substitution-${index}__`);
    cssText =
      quasis[0].value.cooked +
      substitutionNames.map((name, index) => name + quasis[index + 1].value.cooked).join('');
    substitutionMap = _.fromPairs(_.zip(substitutionNames, expressions));
  } else if (t.isStringLiteral(stringArg)) {
    cssText = stringArg.value;
  } else {
    throw new Error('Failed to read CSS');
  }

  if (csstaType === 'web') {
    transformWebCssta(element, state, cssText, substitutionMap, component);
  } else if (csstaType === 'native') {
    transformNativeCssta(element, state, cssText, substitutionMap, component);
  }
};

const externalReferencesToRecord = {
  'react-native': ['StyleSheet'],
  'css-to-react-native': ['default'],
};

module.exports = () => ({
  visitor: {
    ImportDeclaration(element, state) {
      let csstaType;

      const moduleName = element.node.source.value;
      const specifiers = element.node.specifiers;

      const filename = state.file.opts.filename;

      if (moduleName in externalReferencesToRecord) {
        const referencesToRecord = externalReferencesToRecord[moduleName];

        _.forEach((specifier) => {
          let importedName;
          if (t.isImportSpecifier(specifier)) {
            importedName = specifier.imported.name;
          } else if (t.isImportDefaultSpecifier(specifier)) {
            importedName = 'default';
          }

          if (importedName && _.includes(importedName, referencesToRecord)) {
            state.externalReferencesPerFile = _.set(
              [filename, moduleName, importedName],
              specifier.local,
              state.externalReferencesPerFile
            );
          }
        }, specifiers);

        return;
      }

      if (moduleName === 'cssta' || moduleName === 'cssta/web') {
        csstaType = 'web';
      } else if (moduleName === 'cssta/native') {
        csstaType = 'native';
      }

      if (!csstaType) return;

      const defaultSpecifiers = _.flow(
        _.filter({ type: 'ImportDefaultSpecifier' }),
        _.map('local.name'),
        _.compact
      )(specifiers);

      const specifierReferenceTypes = _.flow(
        _.map(reference => [reference, csstaType]),
        _.fromPairs
      )(defaultSpecifiers);

      state.csstaReferenceTypesPerFile = _.update(
        [filename],
        _.assign(specifierReferenceTypes),
        state.csstaReferenceTypesPerFile || {}
      );

      const createComponentReferencePath = [filename, csstaType];
      if (!_.get(createComponentReferencePath, state.createComponentReferences)) {
        const reference = element.scope.generateUidIdentifier('csstaCreateComponent');

        state.createComponentReferences = _.set(
          createComponentReferencePath,
          reference,
          state.createComponentReferences
        );
        const newImport = t.importDeclaration([
          t.importDefaultSpecifier(reference),
        ], t.stringLiteral(createComponentLocations[csstaType]));
        element.replaceWith(newImport);
      } else {
        element.remove();
      }
    },
    CallExpression(element, state) {
      const { node } = element;
      const { callee } = node;
      const [stringArg] = node.arguments;
      if (!t.isTemplateLiteral(stringArg) && !t.isStringLiteral(stringArg)) return;
      transformCsstaCall(element, state, callee, stringArg);
    },
    TaggedTemplateExpression(element, state) {
      const { quasi, tag } = element.node;
      transformCsstaCall(element, state, tag, quasi);
    },
  },
});

module.exports.resetGenerators = transformWebCssta.resetGenerators;

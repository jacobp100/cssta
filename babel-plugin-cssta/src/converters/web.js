/* eslint-disable no-param-reassign */
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const t = require('babel-types');
const _ = require('lodash/fp');
const extractRules = require('cssta/src/web/extractRules');
const cssNameGenerator = require('css-class-generator');
const { jsonToNode, getOrCreateImportReference } = require('../util');


const animationKeywords = [
  'alternate',
  'alternate-reverse',
  'backwards',
  'both',
  'ease',
  'ease-in',
  'ease-in-out',
  'ease-out',
  'forwards',
  'infinite',
  'linear',
  'none',
  'normal',
  'paused',
  'reverse',
  'running',
  'step-end',
  'step-start',
  'initial',
  'inherit',
  'unset',
];

let classGenerator = null;
let animationGenerator = null;

const resetGenerators = () => {
  classGenerator = cssNameGenerator();
  animationGenerator = (function* gen() {
    for (const value of cssNameGenerator()) {
      if (!_.includes(value, animationKeywords)) yield value;
    }
  }());
};

resetGenerators();

const writeCssToFile = (outputCss, cssFilename) => {
  mkdirp.sync(path.dirname(cssFilename));
  fs.writeFileSync(cssFilename, outputCss, {
    encoding: 'utf-8',
    flag: 'w+',
  });
};

module.exports = (element, state, cssText, substititionMap, component) => {
  if (!_.isEmpty(substititionMap)) {
    throw new Error('You cannot use interpolation in template strings (i.e. `color: ${primary}`)'); // eslint-disable-line
  }

  const filename = state.file.opts.filename;
  const cssFilename = path.resolve(
    process.cwd(),
    _.getOr('styles.css', ['opts', 'output'], state)
  );
  let existingCss;

  try {
    existingCss = fs.readFileSync(cssFilename, 'utf-8');
  } catch (e) {
    existingCss = '/* File generated by babel-plugin-cssta */\n';
  }

  const isInjectGlobal = t.isStringLiteral(component) && component.value === 'injectGlobal';

  let commentMarker;

  if (!isInjectGlobal) {
    state.outputIndexPerFile = _.update( // eslint-disable-line
      [filename],
      index => (index || 0) + 1,
      state.outputIndexPerFile || {}
    );

    const index = _.get([filename], state.outputIndexPerFile);

    commentMarker = `/* ${filename.replace(/\*/g, '')} (index: ${index}) */`;
  } else {
    commentMarker = '/* Injected Globals */';
  }

  if (existingCss.indexOf(commentMarker) !== -1) {
    throw new Error('You must remove the existing CSS file before running files through babel');
  }

  let outputCss;
  let newElement = null;

  if (!isInjectGlobal) {
    const { css: output, baseClassName, classNameMap } = extractRules(cssText, {
      generateClassName: () => classGenerator.next().value,
      generateAnimationName: () => animationGenerator.next().value,
    });

    outputCss = `${existingCss}\n${commentMarker}\n${output}`;
    writeCssToFile(outputCss, cssFilename);

    const createComponent = getOrCreateImportReference(
      element,
      state,
      'cssta/lib/web/createComponent',
      'default'
    );
    const baseClass = baseClassName
      ? t.stringLiteral(baseClassName)
      : t.nullLiteral();

    newElement = t.callExpression(createComponent, [
      component,
      t.nullLiteral(), // Gets replaced with Object.keys(classNameMap)
      baseClass,
      jsonToNode(classNameMap),
    ]);
  } else {
    outputCss = `${existingCss}\n${commentMarker}\n${cssText}`;
  }

  writeCssToFile(outputCss, cssFilename);

  if (newElement) {
    element.replaceWith(newElement);
  } else {
    element.remove();
  }
};

module.exports.resetGenerators = resetGenerators;

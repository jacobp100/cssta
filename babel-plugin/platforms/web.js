/* eslint-disable no-param-reassign, no-restricted-syntax, no-template-curly-in-string */
const _ = require("lodash/fp");
const cssNameGenerator = require("css-class-generator");
const extractRules = require("../../src/web/extractRules");
const { jsonToNode, getOrCreateImportReference } = require("../util");
const { startEndMarkers, fileStartEndCommentMarkers } = require("../webUtil");

// Make sure we don't somehow generate an animation name that's a keyword
// This is almost impossible anyway, but whatever
const animationKeywords = `
  alternate alternate-reverse backwards both ease ease-in ease-in-out ease-out forwards infinite
  linear none normal paused reverse running step-end step-start initial inherit unset
`.split(/[^\s]+/g);

let classGenerator = null;
let animationGenerator = null;

const resetGenerators = () => {
  classGenerator = cssNameGenerator();
  animationGenerator = (function* gen() {
    for (const value of cssNameGenerator()) {
      if (!_.includes(value, animationKeywords)) yield value;
    }
  })();
};

resetGenerators();

module.exports = (babel, path, state, component, cssText, substititionMap) => {
  const { types: t } = babel;

  if (!_.isEmpty(substititionMap)) {
    throw new Error(
      "You cannot use interpolation in template strings (i.e. `color: ${primary}`)"
    );
  }

  const isInjectGlobal =
    t.isStringLiteral(component) && component.value === "injectGlobal";

  const { commentStartMarker, commentEndMarker } = isInjectGlobal
    ? startEndMarkers("Injected Globals")
    : fileStartEndCommentMarkers(state);

  let { currentWebCss } = state;
  let newElement = null;

  if (!isInjectGlobal) {
    const { css, args } = extractRules(cssText, {
      generateClassName: () => classGenerator.next().value,
      generateAnimationName: () => animationGenerator.next().value
    });
    const output = css.trim();

    const startIndex = currentWebCss.indexOf(commentEndMarker);
    if (startIndex !== -1) {
      const cssBefore = currentWebCss.slice(0, startIndex);
      const cssAfter = currentWebCss.slice(startIndex);
      currentWebCss = `${cssBefore}${output}\n${cssAfter}`;
    } else {
      currentWebCss = `${currentWebCss}\n${commentStartMarker}${output}\n${commentEndMarker}`;
    }

    const createComponent = getOrCreateImportReference(
      babel,
      path,
      "cssta/lib/web/createComponent",
      "default"
    );

    newElement = t.callExpression(createComponent, [
      component,
      t.nullLiteral(), // Gets replaced with Object.keys(classNameMap)
      jsonToNode(babel, args)
    ]);
  } else {
    currentWebCss = `${commentStartMarker}${cssText}\n${commentEndMarker}${currentWebCss}`;
  }

  state.currentWebCss = currentWebCss;

  if (newElement) {
    path.replaceWith(newElement);
  } else {
    path.remove();
  }
};

module.exports.resetGenerators = resetGenerators;

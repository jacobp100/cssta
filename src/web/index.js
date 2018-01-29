// @flow
/* global document */
const extractRules = require("./extractRules");
const createComponent = require("./createComponent");

const assertNoTemplateParams = cssTextFragments => {
  if (!Array.isArray(cssTextFragments)) {
    return cssTextFragments;
  } else if (cssTextFragments.length === 1) {
    return cssTextFragments[0];
  }
  throw new Error("You cannot use string interpolation with cssta for web");
};

let styleElement = null;
const updateCss = cssText => {
  if (!styleElement) {
    styleElement = document.createElement("style");
    const styleBody = document.createTextNode(cssText);
    styleElement.appendChild(styleBody);
    document.getElementsByTagName("head")[0].appendChild(styleElement);
  } else {
    const existingStyleBody = styleElement.firstChild;
    if (!existingStyleBody) throw new Error("Unexpected error creating styles");
    const newStyleBody = document.createTextNode(cssText);
    styleElement.replaceChild(newStyleBody, existingStyleBody);
  }
};

let componentIndex = 1;
const generateClassName = element => {
  const name =
    typeof element === "string" ? element : element.displayName || "unknown";
  const className = `${name}-${componentIndex}`;
  componentIndex += 1;
  return className;
};

let styleContents = "";
const style = (element /*: any */) => (
  cssTextFragments /*: string[] | string */
) => {
  const cssText = assertNoTemplateParams(cssTextFragments);

  const defaultClassName = generateClassName(element);
  const { css, propTypes, args } = extractRules(cssText, {
    generateClassName: (prop, value) => {
      if (prop == null) {
        return defaultClassName;
      } else if (value == null) {
        return `${defaultClassName}--${prop}`;
      }
      return `${defaultClassName}--${prop}-${value}`;
    },
    generateAnimationName: value => `${defaultClassName}-keyframe-${value}`
  });

  styleContents += css;
  updateCss(styleContents);

  return createComponent(element, propTypes, args);
};

let didInjectGlobal = false;
style.injectGlobal = cssTextFragments => {
  const cssText = assertNoTemplateParams(cssTextFragments);

  if (didInjectGlobal) {
    throw new Error(
      "To help with consistency, you can only call injectGlobal once"
    );
  }

  didInjectGlobal = true;
  styleContents = cssText + styleContents;
  updateCss(styleContents);
};

`a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas
caption cite code col colgroup data datalist dd del details dfn dialog div dl dt em embed fieldset
figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins
kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol
optgroup option output p param picture pre progress q rp rt ruby s samp script section select small
source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track
u ul var video wbr circle clipPath defs ellipse g image line linearGradient mask path pattern
polygon polyline radialGradient rect stop svg text tspan`
  .split(/\s+/m)
  .forEach(tagName => {
    style[tagName] = style(tagName);
  });

module.exports = style;

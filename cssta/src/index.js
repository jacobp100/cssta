/* global document */
const extractRules = require('./extractRules');
const createComponent = require('./createComponent');

let devId = 0;
const getDevId = name => () => {
  devId += 1;
  return `${name}-${devId}`;
};

const createCssElement = (cssText) => {
  const styleElement = document.createElement('style');
  const styleBody = document.createTextNode(cssText);
  styleElement.appendChild(styleBody);
  document.getElementsByTagName('head')[0].appendChild(styleElement);
};

const opts = {
  generateClassName: getDevId('rule'),
  generateAnimationName: getDevId('animation'),
};

const style = tagName => (cssText, ...otherAttributes) => {
  if (otherAttributes.length) {
    throw new Error('You cannot use string interpolation with cssta');
  }

  const { css, baseClassName, classNameMap } = extractRules(cssText, opts);

  createCssElement(css);

  return createComponent(tagName, baseClassName, classNameMap);
};

`a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas
caption cite code col colgroup data datalist dd del details dfn dialog div dl dt em embed fieldset
figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins
kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol
optgroup option output p param picture pre progress q rp rt ruby s samp script section select small
source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track
u ul var video wbr circle clipPath defs ellipse g image line linearGradient mask path pattern
polygon polyline radialGradient rect stop svg text tspan`.split(/\s+/m).forEach((tagName) => {
  style[tagName] = style(tagName);
});

module.exports = style;

console.log(extractRules(`
  :hover {
    color: blue;
  }
`, opts));

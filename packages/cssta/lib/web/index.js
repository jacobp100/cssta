'use strict';

/* global document */
var postcss = require('../../vendor/postcss');
var extractRules = require('./extractRules');
var staticComponent = require('./staticComponent');

var devId = 0;
var getDevId = function getDevId(name) {
  return function () {
    devId += 1;
    return name + '-' + devId;
  };
};

var assertNoTemplateParams = function assertNoTemplateParams(cssTextFragments) {
  if (!Array.isArray(cssTextFragments)) {
    return cssTextFragments;
  } else if (cssTextFragments.length === 1) {
    return cssTextFragments[0];
  }
  throw new Error('You cannot use string interpolation with cssta for web');
};

var styleElement = null;
var stylePipeline = [];
var stylePromise = Promise.resolve();
var updateCss = function updateCss(inputCss) {
  stylePromise = stylePromise.then(function () {
    return postcss(stylePipeline).process(inputCss);
  }).then(function (result) {
    var cssText = result.css;

    if (!styleElement) {
      styleElement = document.createElement('style');
      var styleBody = document.createTextNode(cssText);
      styleElement.appendChild(styleBody);
      document.getElementsByTagName('head')[0].appendChild(styleElement);
    } else {
      var existingStyleBody = styleElement.firstChild;
      var newStyleBody = document.createTextNode(cssText);
      styleElement.replaceChild(newStyleBody, existingStyleBody);
    }
  });
};

var opts = {
  generateClassName: getDevId('rule'),
  generateAnimationName: getDevId('animation')
};

var styleContents = '';
var style = function style(tagName) {
  return function (cssTextFragments) {
    var cssText = assertNoTemplateParams(cssTextFragments);

    var _extractRules = extractRules(cssText, opts),
        css = _extractRules.css,
        propTypes = _extractRules.propTypes,
        baseClassName = _extractRules.baseClassName,
        classNameMap = _extractRules.classNameMap;

    styleContents += css;
    updateCss(styleContents);

    return staticComponent(tagName, propTypes, baseClassName, classNameMap);
  };
};

var didInjectGlobal = false;
style.injectGlobal = function (cssTextFragments) {
  var cssText = assertNoTemplateParams(cssTextFragments);

  if (didInjectGlobal) {
    throw new Error('To help with consistency, you can only call injectGlobal once');
  }

  didInjectGlobal = true;
  styleContents = cssText + styleContents;
  updateCss(styleContents);
};

style.setPostCssPipeline = function (pipeline) {
  stylePipeline = pipeline;
  updateCss(styleContents);
};

'a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas\ncaption cite code col colgroup data datalist dd del details dfn dialog div dl dt em embed fieldset\nfigcaption figure footer form h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins\nkbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol\noptgroup option output p param picture pre progress q rp rt ruby s samp script section select small\nsource span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track\nu ul var video wbr circle clipPath defs ellipse g image line linearGradient mask path pattern\npolygon polyline radialGradient rect stop svg text tspan'.split(/\s+/m).forEach(function (tagName) {
  style[tagName] = style(tagName);
});

module.exports = style;
'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/* eslint-disable no-param-reassign */
var _require = require('css-to-react-native'),
    getPropertyName = _require.getPropertyName;

var getRoot = require('../util/getRoot');

var _require2 = require('../util'),
    varRegExp = _require2.varRegExp,
    varRegExpNonGlobal = _require2.varRegExpNonGlobal,
    isDirectChildOfKeyframes = _require2.isDirectChildOfKeyframes;

var variableRegExp = /^--/;
// Matches whole words, or whole functions (i.e. `var(--hello, with spaces here)`)
var transitionPartRegExp = /([^\s(]+(?:\([^)]*\))?)/g;
var nonTransitionPropertyRegExp = /(?:ease(?:-in)?(?:-out)?|linear|^\d|\()/;

var findLast = function findLast(array, cb) {
  return array.slice().reverse().find(cb);
};
var walkToArray = function walkToArray(walker) {
  var nodes = [];
  walker(function (node) {
    return nodes.push(node);
  });
  return nodes;
};

var getStyleDeclarations = function getStyleDeclarations(nodes) {
  return nodes.filter(function (node) {
    return node.type === 'decl' && !variableRegExp.test(node.prop);
  });
};

var getStyleTuples = function getStyleTuples(nodes) {
  return getStyleDeclarations(nodes).map(function (node) {
    return [node.prop, node.value];
  });
};

var getExportedVariables = function getExportedVariables(nodes) {
  return nodes.filter(function (node) {
    return node.type === 'decl' && variableRegExp.test(node.prop);
  }).reduce(function (accum, node) {
    accum[node.prop.substring(2)] = node.value;
    return accum;
  }, {});
};

var getImportedVariables = function getImportedVariables(nodes) {
  return getStyleDeclarations(nodes).reduce(function (accum, decl) {
    var referencedVariableMatches = decl.value.match(varRegExp);
    if (!referencedVariableMatches) return accum;

    var referencedVariables = referencedVariableMatches.map(function (match) {
      return match.match(varRegExpNonGlobal)[1];
    });

    return accum.concat(referencedVariables);
  }, []);
};

var getTransitions = function getTransitions(declValue) {
  return declValue.split(',').reduce(function (transitions, value) {
    var parts = value.match(transitionPartRegExp);

    if (!parts) return transitions;

    var properties = parts.filter(function (part) {
      return !nonTransitionPropertyRegExp.test(part);
    }).map(getPropertyName);
    var transitionParts = parts.filter(function (part) {
      return nonTransitionPropertyRegExp.test(part);
    });

    return properties.reduce(function (accum, property) {
      accum[property] = transitionParts;
      return accum;
    }, transitions);
  }, {});
};

var getAnimation = function getAnimation(declValue) {
  return declValue.match(transitionPartRegExp);
};

var specialTuples = ['transition', 'animation'];

var getRuleBody = function getRuleBody(rule) {
  var selector = rule.selector;

  var styleTuples = getStyleTuples(rule.nodes);

  var transitionDeclValue = findLast(styleTuples, function (styleTuple) {
    return styleTuple[0] === 'transition';
  });
  var transitions = transitionDeclValue ? getTransitions(transitionDeclValue[1]) : {};

  var animationDeclValue = findLast(styleTuples, function (styleTuple) {
    return styleTuple[0] === 'animation';
  });
  var animation = animationDeclValue ? getAnimation(animationDeclValue[1]) : null;

  styleTuples = styleTuples.filter(function (styleTuple) {
    return !specialTuples.includes(styleTuple[0]);
  });

  var exportedVariables = getExportedVariables(rule.nodes);
  var importedVariables = getImportedVariables(rule.nodes);

  return {
    selector: selector, styleTuples: styleTuples, transitions: transitions, animation: animation, exportedVariables: exportedVariables, importedVariables: importedVariables
  };
};

var getKeyframes = function getKeyframes(atRule) {
  return walkToArray(function (cb) {
    return atRule.walkRules(cb);
  }).reduce(function (accum, rule) {
    var timeSelectors = rule.selector.split(',').map(function (selector) {
      return selector.trim();
    }).map(function (selector) {
      if (/[\d.]%/.test(selector)) return parseFloat(selector) / 100;
      if (/start/i.test(selector)) return 0;
      if (/end/i.test(selector)) return 1;
      throw new Error('Cannot parse keyframe time: ' + selector);
    });

    var styleTuples = getStyleTuples(walkToArray(function (cb) {
      return rule.walkDecls(cb);
    }));

    var newKeyframeBlocks = timeSelectors.map(function (time) {
      return { time: time, styleTuples: styleTuples };
    });
    return accum.concat(newKeyframeBlocks);
  }, []).sort(function (a, b) {
    return a.time - b.time;
  });
};

module.exports = function (inputCss) {
  var _getRoot = getRoot(inputCss),
      root = _getRoot.root,
      propTypes = _getRoot.propTypes;

  var rules = walkToArray(function (cb) {
    return root.walkRules(cb);
  }).filter(function (rule) {
    return !isDirectChildOfKeyframes(rule);
  }).map(getRuleBody);

  var keyframesStyleTuples = walkToArray(function (cb) {
    return root.walkAtRules(cb);
  }).filter(function (atRule) {
    return atRule.name === 'keyframes';
  }).reduce(function (accum, atRule) {
    accum[atRule.params] = getKeyframes(atRule);
    return accum;
  }, {});

  var transitionedProperties = Object.keys(Object.assign.apply(Object, [{}].concat(_toConsumableArray(rules.map(function (rule) {
    return rule.transitions;
  })))));

  var importedVariables = rules.reduce(function (outerAccum, rule) {
    return rule.importedVariables.reduce(function (innerAccum, importedVariable) {
      return innerAccum.indexOf(importedVariable) === -1 ? innerAccum.concat([importedVariable]) : innerAccum;
    }, outerAccum);
  }, []);

  var managerArgs = { keyframesStyleTuples: keyframesStyleTuples, transitionedProperties: transitionedProperties, importedVariables: importedVariables };

  return { rules: rules, propTypes: propTypes, managerArgs: managerArgs };
};
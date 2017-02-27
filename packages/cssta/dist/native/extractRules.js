'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/* eslint-disable no-param-reassign */
var _require = require('css-to-react-native'),
    getPropertyName = _require.getPropertyName;

var getRoot = require('../util/getRoot');

var _require2 = require('../util'),
    varRegExp = _require2.varRegExp,
    varRegExpNonGlobal = _require2.varRegExpNonGlobal;

var variableRegExp = /^--/;
// Matches whole words, or whole functions (i.e. `var(--hello, with spaces here)`)
var transitionPartRegExp = /([^\s(]+(?:\([^)]*\))?)/g;
var nonTransitionPropertyRegExp = /(?:ease(?:-in|-out)?|linear|^\d|\()/g;

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
    var property = parts ? parts.find(function (part) {
      return !nonTransitionPropertyRegExp.test(part);
    }) : null;

    if (property) transitions[getPropertyName(property)] = parts.filter(function (part) {
      return part !== property;
    });

    return transitions;
  }, {});
};

module.exports = function (inputCss) {
  var _getRoot = getRoot(inputCss),
      root = _getRoot.root,
      propTypes = _getRoot.propTypes;

  var rules = [];

  root.walkRules(function (node) {
    var selector = node.selector;

    var styleTuples = getStyleTuples(node.nodes);

    // findLast (not in spec)
    var transitionDeclValue = styleTuples.reduce(function (currentValue, styleTuple) {
      return styleTuple[0] === 'transition' ? styleTuple[1] : currentValue;
    }, null);
    var transitions = transitionDeclValue ? getTransitions(transitionDeclValue) : {};

    styleTuples = styleTuples.filter(function (styleTuple) {
      return styleTuple[0] !== 'transition';
    });

    var exportedVariables = getExportedVariables(node.nodes);
    var importedVariables = getImportedVariables(node.nodes);

    rules.push({ selector: selector, styleTuples: styleTuples, transitions: transitions, exportedVariables: exportedVariables, importedVariables: importedVariables });
  });

  var transitions = Object.keys(Object.assign.apply(Object, [{}].concat(_toConsumableArray(rules.map(function (rule) {
    return rule.transitions;
  })))));

  var importedVariables = rules.reduce(function (outerAccum, rule) {
    return rule.importedVariables.reduce(function (innerAccum, importedVariable) {
      return innerAccum.indexOf(importedVariable) === -1 ? innerAccum.concat([importedVariable]) : innerAccum;
    }, outerAccum);
  }, []);

  var managerArgs = { transitions: transitions, importedVariables: importedVariables };

  return { rules: rules, propTypes: propTypes, managerArgs: managerArgs };
};
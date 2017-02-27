'use strict';

/* eslint-disable no-param-reassign */
var DepGraph = require('dependency-graph').DepGraph;

var _require = require('./index'),
    varRegExp = _require.varRegExp,
    varRegExpNonGlobal = _require.varRegExpNonGlobal;

module.exports = function (definedVariables, variablesFromScope) {
  var graph = new DepGraph();

  var variableNames = Object.keys(definedVariables);

  variableNames.forEach(function (variableName) {
    graph.addNode(variableName);
  });

  variableNames.forEach(function (variableName) {
    var referencedVariableMatches = definedVariables[variableName].match(varRegExp);
    if (!referencedVariableMatches) return;

    var referencedVariables = referencedVariableMatches.map(function (match) {
      return match.match(varRegExpNonGlobal)[1];
    });

    referencedVariables.forEach(function (referencedVariableName) {
      if (referencedVariableName in definedVariables) {
        graph.addDependency(variableName, referencedVariableName);
      }
    });
  });

  var appliedVariables = graph.overallOrder(false).reduce(function (accum, variableName) {
    var value = definedVariables[variableName].replace(varRegExp, function (m, reference, fallback) {
      return accum[reference] || variablesFromScope[reference] || fallback;
    });
    accum[variableName] = value;
    return accum;
  }, {});

  return appliedVariables;
};
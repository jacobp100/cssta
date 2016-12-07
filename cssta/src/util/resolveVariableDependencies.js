/* eslint-disable no-param-reassign */
const DepGraph = require('dependency-graph').DepGraph;
const { varRegExp, varRegExpNonGlobal } = require('.');

module.exports = (definedVariables, variablesFromScope) => {
  const graph = new DepGraph();

  const variableNames = Object.keys(definedVariables);

  variableNames.forEach((variableName) => {
    graph.addNode(variableName);
  });

  variableNames.forEach((variableName) => {
    const referencedVariableMatches = definedVariables[variableName].match(varRegExp);
    if (!referencedVariableMatches) return;

    const referencedVariables = referencedVariableMatches
      .map(match => match.match(varRegExpNonGlobal)[1]);

    referencedVariables.forEach((referencedVariableName) => {
      if (referencedVariableName in definedVariables) {
        graph.addDependency(variableName, referencedVariableName);
      }
    });
  });

  const appliedVariables = graph.overallOrder(false).reduce((accum, variableName) => {
    const value = definedVariables[variableName].replace(varRegExp, (m, reference, fallback) => (
      accum[reference] || variablesFromScope[reference] || fallback
    ));
    accum[variableName] = value;
    return accum;
  }, {});

  return appliedVariables;
};

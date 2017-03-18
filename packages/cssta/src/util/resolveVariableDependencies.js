// @flow
/* eslint-disable no-param-reassign */
const DepGraph = require('dependency-graph').DepGraph;
const { varRegExp, varRegExpNonGlobal } = require('./index');

module.exports = (
  definedVariables /*: { [key:string]: string } */,
  variablesFromScope /*: { [key:string]: string } */
) /*: { [key:string]: string } */ => {
  const graph = new DepGraph();

  const variableNames = Object.keys(definedVariables);

  variableNames.forEach((variableName) => {
    graph.addNode(variableName);
  });

  variableNames.forEach((variableName) => {
    const referencedVariableMatches = definedVariables[variableName].match(varRegExp);
    if (!referencedVariableMatches) return;

    const referencedVariables = referencedVariableMatches
      .map(match => {
        const matchedVariable = match.match(varRegExpNonGlobal);
        return matchedVariable ? matchedVariable[1] : null;
      })
      .filter(Boolean);

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

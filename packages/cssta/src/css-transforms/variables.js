// @flow
const { varRegExp } = require("../util");

module.exports = (
  value /*: string */,
  appliedVariables /*: { [key:string]: string } */
) /*: string */ =>
  value.replace(
    varRegExp,
    (m, variableName, fallback) => appliedVariables[variableName] || fallback
  );

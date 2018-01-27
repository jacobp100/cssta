// @flow
/*
CAUTION!

This file could be included even after running the babel plugin.

Make sure you don't import large libraries.
*/
const { varRegExp } = require("../util");

module.exports = (
  value /*: string */,
  appliedVariables /*: { [key:string]: string } */
) /*: string */ =>
  value.replace(
    varRegExp,
    (m, variableName, fallback) => appliedVariables[variableName] || fallback
  );

// @flow
/*
CAUTION!

This file could be included even after running the babel plugin.

Make sure you don't import large libraries.
*/
/* eslint-disable no-param-reassign, no-restricted-syntax */

module.exports.shallowEqual = (
  tom /*: Object */,
  jerry /*: Object */
) /*: boolean */ => {
  if (tom === jerry) return true;

  for (const key in jerry) {
    if (!(key in tom)) return false;
  }

  for (const key in tom) {
    if (!(key in jerry) || tom[key] !== jerry[key]) return false;
  }

  return true;
};

module.exports.mapValues = (
  iteratee /*: (value: any) => any */,
  object /*: Object */
) /*: Object */ =>
  Object.keys(object).reduce((accum, key) => {
    accum[key] = iteratee(object[key]);
    return accum;
  }, {});

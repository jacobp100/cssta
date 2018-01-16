// @flow
/* eslint-disable no-param-reassign */

const keyframesRegExp = /keyframes$/i;

module.exports.shallowEqual = (
  tom /*: Object */,
  jerry /*: Object */
) /*: boolean */ => {
  if (tom === jerry) return true;

  /* eslint-disable */
  for (const key in jerry) {
    if (!(key in tom)) return false;
  }

  for (const key in tom) {
    if (!(key in jerry) || tom[key] !== jerry[key]) return false;
  }
  /* eslint-enable */

  return true;
};

module.exports.keyframesRegExp = keyframesRegExp;
module.exports.isDirectChildOfKeyframes = (node /*: Object */) /*: boolean */ =>
  node.parent &&
  node.parent.type === "atrule" &&
  keyframesRegExp.test(node.parent.name);
module.exports.varRegExp = /var\s*\(\s*--([_a-z0-9-]+)\s*(?:,\s*([^)]+))?\)/gi;
module.exports.varRegExpNonGlobal = /var\s*\(\s*--([_a-z0-9-]+)\s*(?:,\s*([^)]+))?\)/i;

module.exports.mapValues = (
  iteratee /*: (value: any) => any */,
  object /*: Object */
) /*: Object */ =>
  Object.keys(object).reduce((accum, key) => {
    accum[key] = iteratee(object[key]);
    return accum;
  }, {});

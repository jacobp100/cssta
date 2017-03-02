'use strict';

/* eslint-disable no-param-reassign */

var keyframesRegExp = /keyframes$/i;

module.exports.shallowEqual = function (tom, jerry) {
  if (tom === jerry) return true;

  /* eslint-disable */
  for (var key in jerry) {
    if (!(key in tom)) return false;
  }

  for (var _key in tom) {
    if (!(_key in jerry) || tom[_key] !== jerry[_key]) return false;
  }
  /* eslint-enable */

  return true;
};

module.exports.keyframesRegExp = keyframesRegExp;
module.exports.isDirectChildOfKeyframes = function (node) {
  return node.parent && node.parent.type === 'atrule' && keyframesRegExp.test(node.parent.name);
};
module.exports.varRegExp = /var\s*\(\s*--([_a-z0-9-]+)\s*(?:,\s*([^)]+))?\)/ig;
module.exports.varRegExpNonGlobal = /var\s*\(\s*--([_a-z0-9-]+)\s*(?:,\s*([^)]+))?\)/i;
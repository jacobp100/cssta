const keyframesRegExp = /keyframes$/i;

module.exports.keyframesRegExp = keyframesRegExp;
module.exports.isDirectChildOfKeyframes = node =>
  node.parent && node.parent.type === 'atrule' && keyframesRegExp.test(node.parent.name);
module.exports.varRegExp = /var\s*\(\s*--([_a-z0-9-]+)\s*(?:,\s*([^)]+))?\)/ig;
module.exports.varRegExpNonGlobal = /var\s*\(\s*--([_a-z0-9-]+)\s*(?:,\s*([^)]+))?\)/i;

// @flow
module.exports.varRegExp = /var\s*\(\s*--([_a-z0-9-]+)\s*(?:,\s*([^)]+))?\)/gi;
module.exports.varRegExpNonGlobal = /var\s*\(\s*--([_a-z0-9-]+)\s*(?:,\s*([^)]+))?\)/i;

// @flow
module.exports.varRegExp = /var\s*\(\s*--([_a-z0-9-]+)\s*(?:,\s*([^)]+))?\)/gi;
module.exports.varRegExpNonGlobal = /var\s*\(\s*--([_a-z0-9-]+)\s*(?:,\s*([^)]+))?\)/i;
module.exports.viewportUnitRegExp = /([+-\d.Ee]+)(vw|vh|vmin|vmax)/g;
module.exports.viewportUnitRegExpNonGlobal = /([+-\d.Ee]+)(vw|vh|vmin|vmax)/;

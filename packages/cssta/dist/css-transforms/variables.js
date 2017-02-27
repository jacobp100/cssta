'use strict';

var _require = require('../util'),
    varRegExp = _require.varRegExp;

module.exports = function (value, appliedVariables) {
  return value.replace(varRegExp, function (m, variableName, fallback) {
    return appliedVariables[variableName] || fallback;
  });
};
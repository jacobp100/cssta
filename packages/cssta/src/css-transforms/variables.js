const { varRegExp } = require('../util');

module.exports = (value, appliedVariables) => (
  value.replace(varRegExp, (m, variableName, fallback) => (
    appliedVariables[variableName] || fallback
  ))
);

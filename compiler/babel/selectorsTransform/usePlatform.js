const { getOrCreateImport } = require("../util");

module.exports = (babel, path) => {
  const { types: t } = babel;

  const platform = getOrCreateImport(babel, path, "react-native", "Platform");
  const platformOs = t.memberExpression(platform, t.identifier("OS"));

  return platformOs;
};

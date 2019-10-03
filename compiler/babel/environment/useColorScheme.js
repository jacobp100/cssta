const { getOrCreateImport, createVariable } = require("../util");

module.exports = (babel, path) => {
  const { types: t } = babel;
  const useColorScheme = getOrCreateImport(
    babel,
    path,
    "react-native",
    "useColorScheme"
  );

  const colorScheme = createVariable(
    babel,
    path,
    "colorScheme",
    t.callExpression(useColorScheme, [])
  );

  return colorScheme;
};

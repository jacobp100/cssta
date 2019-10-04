import { getOrCreateImport, createVariable } from "../util";

export default (babel: any, path: any) => {
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

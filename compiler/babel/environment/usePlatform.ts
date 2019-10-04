import { getOrCreateImport } from "../util";

export default (babel: any, path: any) => {
  const { types: t } = babel;

  const platform = getOrCreateImport(babel, path, "react-native", "Platform");
  const platformOs = t.memberExpression(platform, t.identifier("OS"));

  return platformOs;
};

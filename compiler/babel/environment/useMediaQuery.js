const { generateNiceId, getOrCreateImport } = require("../util");

module.exports = (babel, path) => {
  const { types: t } = babel;

  const windowVariables = {
    width: generateNiceId(babel, path, "windowWidth"),
    height: generateNiceId(babel, path, "windowHeight")
  };

  const useWindowDimensionsImport = getOrCreateImport(
    babel,
    path,
    "cssta/runtime/useWindowDimensions"
  );
  const windowDeclarator = t.variableDeclaration("const", [
    t.variableDeclarator(
      t.objectPattern([
        t.objectProperty(t.identifier("width"), windowVariables.width),
        t.objectProperty(t.identifier("height"), windowVariables.height)
      ]),
      t.callExpression(useWindowDimensionsImport, [])
    )
  ]);

  path.pushContainer("body", windowDeclarator);

  return windowVariables;
};

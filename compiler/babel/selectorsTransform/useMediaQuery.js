const { generateNiceId, getOrCreateImport } = require("../util");

module.exports = (babel, path) => {
  const { types: t } = babel;

  const screenVariables = {
    width: generateNiceId(babel, path, "screenWidth"),
    height: generateNiceId(babel, path, "screenHeight")
  };

  const useMediaQueryImport = getOrCreateImport(
    babel,
    path,
    "cssta/runtime/useMediaQuery"
  );
  const screenDeclarator = t.variableDeclaration("const", [
    t.variableDeclarator(
      t.objectPattern([
        t.objectProperty(t.identifier("width"), screenVariables.width),
        t.objectProperty(t.identifier("height"), screenVariables.height)
      ]),
      t.callExpression(useMediaQueryImport, [])
    )
  ]);

  path.pushContainer("body", screenDeclarator);

  return screenVariables;
};

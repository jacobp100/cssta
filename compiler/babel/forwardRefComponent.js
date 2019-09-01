const { getOrCreateImport } = require("./util");

const generateIdentifier = (babel, inputKey, { propKeys }) => {
  const { types: t } = babel;
  let key = inputKey;
  while (propKeys[key] != null) {
    key = `_${key}`;
  }
  return t.identifier(key);
};

module.exports = (babel, nodePath, { propTypes }) => {
  const { types: t } = babel;

  const propKeys = Object.keys(propTypes);
  const propsSpread = propKeys.map(key =>
    t.objectProperty(
      t.identifier(key),
      t.identifier(key),
      false /* computed */,
      true /* shorthand */
    )
  );

  const propsVariable = generateIdentifier(babel, "props", { propKeys });
  const refVariable = generateIdentifier(babel, "ref", { propKeys });

  const propsObject =
    propsSpread.length === 0
      ? propsVariable
      : t.objectPattern([...propsSpread, t.restElement(propsVariable)]);

  const reactImport = getOrCreateImport(babel, nodePath, "react", undefined, {
    preferredName: "React"
  });
  const componentDefinition = t.callExpression(
    t.memberExpression(reactImport, t.identifier("forwardRef")),
    [
      t.arrowFunctionExpression(
        [propsObject, refVariable],
        t.blockStatement([])
      )
    ]
  );

  nodePath.replaceWith(componentDefinition);

  const path = nodePath.get("arguments.0.body");

  return { path, propsVariable, refVariable };
};

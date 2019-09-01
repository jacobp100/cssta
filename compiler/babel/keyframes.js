const styleBody = require("./styleSheet/styleBody");
const { createTopLevelVariable } = require("./util");

const createKeyframeStatic = (babel, path, substitutionMap, keyframe) => {
  const { types: t } = babel;
  return t.objectExpression([
    t.objectProperty(t.stringLiteral("time"), t.numericLiteral(keyframe.time)),
    t.objectProperty(
      t.stringLiteral("style"),
      styleBody(babel, path, substitutionMap, keyframe.styleTuples)
    )
  ]);
};

const createKeyframesStatic = (babel, path, substitutionMap, keyframes) => {
  const { types: t } = babel;
  return t.arrayExpression(
    keyframes.map(keyframe =>
      createKeyframeStatic(babel, path, substitutionMap, keyframe)
    )
  );
};

module.exports = (babel, path, rules) => {
  const { types: t } = babel;
  const { importedKeyframeVariables, keyframesStyleTuples } = rules;

  let keyframesVariable;

  if (importedKeyframeVariables.length == 0) {
    const keyframes = t.objectExpression(
      Object.entries(keyframesStyleTuples).map(([keyframeName, keyframes]) =>
        babel.types.objectProperty(
          babel.types.stringLiteral(keyframeName),
          createKeyframesStatic(babel, path, {}, keyframes)
        )
      )
    );
    keyframesVariable = createTopLevelVariable(
      babel,
      path,
      "keyframes",
      keyframes
    );
  } else {
    throw new Error("Keyframes do not yet support CSS custom properties");
  }

  return keyframesVariable;
};

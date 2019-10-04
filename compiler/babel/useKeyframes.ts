import { ComponentDefinition, KeyframeOfStyleTuples } from "../css/types";
import styleBody from "./styleSheet/styleBody";
import { SubstitutionMap } from "./extractCss";
import { createTopLevelVariable } from "./util";

const createKeyframeStatic = (
  babel: any,
  path: any,
  substitutionMap: Record<string, any>,
  keyframe: KeyframeOfStyleTuples
) => {
  const { types: t } = babel;
  return t.objectExpression([
    t.objectProperty(t.stringLiteral("time"), t.numericLiteral(keyframe.time)),
    t.objectProperty(
      t.stringLiteral("style"),
      styleBody(babel, path, substitutionMap, keyframe.styleTuples)
    )
  ]);
};

const createKeyframesStatic = (
  babel: any,
  path: any,
  substitutionMap: SubstitutionMap,
  sequence: KeyframeOfStyleTuples[]
) => {
  const { types: t } = babel;
  return t.arrayExpression(
    sequence.map(keyframe =>
      createKeyframeStatic(babel, path, substitutionMap, keyframe)
    )
  );
};

export default (babel: any, path: any, cssOutput: ComponentDefinition) => {
  const { types: t } = babel;
  const { keyframes } = cssOutput;

  const keyframesImportVariables = keyframes.some(
    keyframe => keyframe.importedVariables.length !== 0
  );

  let keyframesVariable: any;

  if (!keyframesImportVariables) {
    const keyframesExpression = t.objectExpression(
      keyframes.map(({ name, sequence }) =>
        babel.types.objectProperty(
          babel.types.stringLiteral(name),
          createKeyframesStatic(babel, path, {}, sequence)
        )
      )
    );
    keyframesVariable = createTopLevelVariable(
      babel,
      path,
      "keyframes",
      keyframesExpression
    );
  } else {
    throw new Error("Keyframes do not yet support CSS custom properties");
  }

  return keyframesVariable;
};

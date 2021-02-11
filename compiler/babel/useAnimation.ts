import flattenAnimation from "../../runtime/flattenAnimation";
import { ComponentDefinition } from "../css/types";
import { Environment } from "./environment";
import buildCondition from "./buildCondition";
import {
  createTopLevelVariable,
  createVariable,
  jsonToNode,
  getOrCreateImport,
} from "./util";

export default (
  babel: any,
  path: any,
  cssOutput: ComponentDefinition,
  environment: Environment,
  { styleVariable, keyframesVariable, customPropertiesVariable }
) => {
  const { types: t } = babel;
  const { animations } = cssOutput;

  // FIXME: We could be more granular than useCustomPropertyShorthandParts whenever one part has a variable in
  const animationImportsVariables = animations.some(
    (animation) => animation.importedVariables.length > 0
  );

  let animationExpression: any;
  let animationPartsExpression: any;

  if (animations.length === 0) {
    animationExpression = t.nullLiteral();
  } else if (
    !animationImportsVariables &&
    animations.length === 1 &&
    animations[0].condition == null
  ) {
    animationExpression = createTopLevelVariable(
      babel,
      path,
      "animation",
      jsonToNode(babel, flattenAnimation([animations[0].part]))
    );
  } else {
    animationPartsExpression = t.arrayExpression(
      animations.map(({ condition, part }) => {
        const parts = jsonToNode(babel, part);

        return condition == null
          ? parts
          : t.conditionalExpression(
              buildCondition(babel, condition, environment),
              parts,
              t.nullLiteral()
            );
      })
    );
  }

  if (animationImportsVariables) {
    const useCustomPropertyShorthandPartsImport = getOrCreateImport(
      babel,
      path,
      "cssta/runtime/useCustomPropertyShorthandParts"
    );
    const unresolvedAnimationPartsVariable = createVariable(
      babel,
      path,
      "unresolvedAnimationParts",
      animationPartsExpression
    );
    const useCustomPropertyAnimation = t.callExpression(
      useCustomPropertyShorthandPartsImport,
      [unresolvedAnimationPartsVariable, customPropertiesVariable]
    );
    animationPartsExpression = createVariable(
      babel,
      path,
      "animationParts",
      useCustomPropertyAnimation
    );
  }

  if (animationExpression == null) {
    const flattenAnimationFnImport = getOrCreateImport(
      babel,
      path,
      "cssta/runtime/flattenAnimation"
    );
    animationExpression = createVariable(
      babel,
      path,
      "animation",
      t.callExpression(flattenAnimationFnImport, [animationPartsExpression])
    );
  }

  const useAnimationImport = getOrCreateImport(
    babel,
    path,
    "cssta/runtime/useAnimation"
  );
  path.pushContainer(
    "body",
    t.expressionStatement(
      t.assignmentExpression(
        "=",
        styleVariable,
        t.callExpression(useAnimationImport, [
          keyframesVariable,
          animationExpression,
          styleVariable,
        ])
      )
    )
  );
};

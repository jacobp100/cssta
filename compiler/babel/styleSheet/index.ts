import { StyleTuple } from "../../../runtime/cssUtil";
import {
  StyleDeclaration,
  ComponentDefinition,
  Condition,
  StyleType,
  StyleTuplesDeclaration,
  StyleMixinDeclaration,
} from "../../css/types";
import { Environment } from "../environment";
import { SubstitutionMap } from "../extractSubstitutionMap";
import {
  createTopLevelVariable,
  createVariable,
  getOrCreateImport,
} from "../util";
import styleBody from "./styleBody";
import { createTopLevelStyleTuplesVariable } from "./styleTuples";
import {
  ViewportMode,
  getViewportMode,
  interpolateViewportUnits,
} from "./viewport";

export enum OptimizationFlag {
  None,
  SupersetsPrevious,
}

const createVariablesStyleExpression = (
  babel: any,
  path: any,
  { substitutionMap, customPropertiesVariable, viewportMode },
  styleTuples: StyleTuple[]
) => {
  const { types: t } = babel;

  const baseUnresolvedStyleTuplesVariable = createTopLevelStyleTuplesVariable(
    babel,
    path,
    substitutionMap,
    styleTuples
  );

  let unresolvedStyleTuplesVariable: any;
  if (viewportMode === ViewportMode.None) {
    unresolvedStyleTuplesVariable = baseUnresolvedStyleTuplesVariable;
  } else {
    if (Object.keys(substitutionMap).length !== 0) {
      throw new Error(
        "String interpolation (${value}) is not yet supported when in combination with viewport units or CSS custom properties"
      );
    }

    const useViewportStyleTuplesImport = getOrCreateImport(
      babel,
      path,
      "cssta/runtime/useViewportStyleTuples"
    );
    unresolvedStyleTuplesVariable = createVariable(
      babel,
      path,
      "unresolvedStyleTuples",
      t.callExpression(useViewportStyleTuplesImport, [
        baseUnresolvedStyleTuplesVariable,
      ]),
      { prefix0: true }
    );
  }

  const useCustomPropertyStylesImport = getOrCreateImport(
    babel,
    path,
    "cssta/runtime/useCustomPropertyStyle"
  );
  const styleExpression = createVariable(
    babel,
    path,
    "styles",
    t.callExpression(useCustomPropertyStylesImport, [
      unresolvedStyleTuplesVariable,
      customPropertiesVariable,
    ])
  );
  return styleExpression;
};

const createStyleExpression = (
  babel: any,
  path: any,
  substitutionMap: SubstitutionMap,
  environment: Environment,
  customPropertiesVariable: any,
  rule: StyleTuplesDeclaration,
  comment?: string
) => {
  const { types: t } = babel;
  const { styleTuples, importedVariables } = rule;

  const viewportMode = getViewportMode(rule);
  const importsVariables = importedVariables.length !== 0;

  let styleExpression: any;
  if (importsVariables) {
    styleExpression = createVariablesStyleExpression(
      babel,
      path,
      { substitutionMap, customPropertiesVariable, viewportMode },
      styleTuples
    );
  } else if (viewportMode === ViewportMode.ComplexUnits) {
    const unresolvedStyleTuplesVariable = createTopLevelStyleTuplesVariable(
      babel,
      path,
      substitutionMap,
      styleTuples
    );
    const cssToReactNativeImport = getOrCreateImport(
      babel,
      path,
      "cssta/runtime/useViewportStyle"
    );
    styleExpression = createVariable(
      babel,
      path,
      "styles",
      t.callExpression(cssToReactNativeImport, [unresolvedStyleTuplesVariable]),
      { prefix0: true }
    );
  } else if (viewportMode === ViewportMode.SimpleLengthUnits) {
    const [
      nextSubstitutionMap,
      styleTuplesWithViewportSubstitutions,
    ] = interpolateViewportUnits(
      babel,
      substitutionMap,
      environment,
      styleTuples
    );
    styleExpression = styleBody(
      babel,
      path,
      nextSubstitutionMap,
      styleTuplesWithViewportSubstitutions
    );
  } else {
    const style = styleBody(babel, path, substitutionMap, styleTuples);

    if (comment != null) {
      style.leadingComments = [{ type: "CommentBlock", value: ` ${comment} ` }];
    }

    styleExpression = createTopLevelVariable(babel, path, "styles", style, {
      prefix0: true,
    });
  }

  return styleExpression;
};

const createMixinExpression = (
  babel: any,
  path: any,
  substitutionMap: SubstitutionMap,
  rule: StyleMixinDeclaration
): any => {
  const { types: t } = babel;
  const substitution = substitutionMap[rule.substitution];

  if (substitution == null) {
    throw new Error(
      "Mixins should use interpolation (e.g. @include ${useStyles})"
    );
  }

  return createVariable(
    babel,
    path,
    "mixinInclude",
    t.callExpression(t.cloneDeep(substitution), []),
    { prefix0: true }
  );
};

const mergeFirstStyleIntoAllRules = (styles: StyleTuplesDeclaration[]) => {
  const mergeeRule = styles[0];
  const stylesMerged = styles.map((rule) => {
    if (rule === mergeeRule) return rule;

    const ownStyleKeys = new Set(
      rule.styleTuples.map((styleTuple) => styleTuple[0])
    );
    const stylesToMerge = mergeeRule.styleTuples.filter(
      (styleTuple) => !ownStyleKeys.has(styleTuple[0])
    );

    if (stylesToMerge.length === 0) return rule;

    const mergedStyleTuples = [...stylesToMerge, ...rule.styleTuples];
    return { ...rule, styleTuples: mergedStyleTuples };
  });
  return stylesMerged;
};

const getOptimizationFlag = (styles: StyleDeclaration[]) => {
  let lastStyleKeys: string[] | null = null;
  return styles.map((rule) => {
    if (rule.type === StyleType.Mixin) {
      lastStyleKeys = null;
      return OptimizationFlag.None;
    }

    const ownStyleKeys = rule.styleTuples.map((styleTuple) => styleTuple[0]);

    const supersets =
      lastStyleKeys != null &&
      lastStyleKeys.every((key) => ownStyleKeys.includes(key));

    lastStyleKeys = ownStyleKeys;

    return supersets
      ? OptimizationFlag.SupersetsPrevious
      : OptimizationFlag.None;
  });
};

export type StyleSheetExpression = {
  condition: Condition | null;
  expression: any;
  optimizationFlag: OptimizationFlag;
};

export default (
  babel: any,
  path: any,
  { styles }: ComponentDefinition,
  substitutionMap: SubstitutionMap,
  environment: Environment,
  { customPropertiesVariable }
): StyleSheetExpression[] => {
  let styleSheetRuleExpressions: StyleSheetExpression[];
  if (
    styles.length === 2 &&
    styles[0].condition == null &&
    styles.every((style) => style.type === StyleType.Tuples)
  ) {
    const mergedStyleTuples = mergeFirstStyleIntoAllRules(
      styles as StyleTuplesDeclaration[]
    );
    styleSheetRuleExpressions = mergedStyleTuples.map((rule, i) => {
      const didMergeStyleTuples = rule !== mergedStyleTuples[i];
      const comment = didMergeStyleTuples
        ? "Some styles have been duplicated to improve performance"
        : null;
      const { condition } = rule;
      const expression = createStyleExpression(
        babel,
        path,
        substitutionMap,
        environment,
        customPropertiesVariable,
        rule,
        comment
      );
      const optimizationFlag =
        i !== 0 ? OptimizationFlag.SupersetsPrevious : OptimizationFlag.None;
      return { condition, expression, optimizationFlag };
    });
  } else {
    const stylesheetOptimizationFlags = getOptimizationFlag(styles);
    const styleSheetExpressions = styles.map((rule) =>
      rule.type === StyleType.Tuples
        ? createStyleExpression(
            babel,
            path,
            substitutionMap,
            environment,
            customPropertiesVariable,
            rule
          )
        : createMixinExpression(babel, path, substitutionMap, rule)
    );
    styleSheetRuleExpressions = styles.map((style, i) => ({
      condition: style.condition,
      expression: styleSheetExpressions[i],
      optimizationFlag: stylesheetOptimizationFlags[i],
    }));
  }

  return styleSheetRuleExpressions;
};

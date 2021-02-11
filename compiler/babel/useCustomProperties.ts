// const { keyBloom } = require("../../runtime/bloomFilter");
import {
  ComponentDefinition,
  Condition,
  VariableExportDeclaration,
} from "../css/types";
import { Environment } from "./environment";
import buildCondition from "./buildCondition";
import {
  createTopLevelVariable,
  createVariable,
  getOrCreateImport,
} from "./util";

const conditionsEqual = (a: Condition | null, b: Condition | null) => {
  if (a == null) {
    return b == null;
  } else if (b == null) {
    return false;
  } else {
    return a.selector === b.selector && a.mediaQuery === b.mediaQuery;
  }
};

type ExportedVariablesGroup = {
  condition: Condition;
  values: VariableExportDeclaration[];
};

export default (
  babel: any,
  path: any,
  cssOutput: ComponentDefinition,
  environment: Environment
) => {
  const { types: t } = babel;
  const { exportedVariables } = cssOutput;

  const groups: ExportedVariablesGroup[] = [];
  exportedVariables.forEach((exportedVariables) => {
    const { condition } = exportedVariables;

    const lastGroup = groups[groups.length - 1];
    let group: ExportedVariablesGroup;
    if (lastGroup == null || !conditionsEqual(lastGroup.condition, condition)) {
      group = { condition, values: [] };
      groups.push(group);
    } else {
      group = lastGroup;
    }
    group.values.push(exportedVariables);
  });

  let bloomFilterExpression: any;
  let exportedVariablesExpression: any;

  if (groups.length === 0) {
    /*
    We can use a bloom filter to ignore updates from variables we don't use, but
    we can only do this if we do not export variables. Otherwise we will skip
    updates from variables from child components
    */
    // const allImports = new Set([
    //   ...importedRuleVariables,
    //   ...importedTransitionVariables,
    //   ...importedAnimationVariables,
    //   ...importedKeyframeVariables
    // ]);
    // const bloomFilter = Array.from(allImports, keyBloom).reduce(
    //   (a, b) => a | b,
    //   0
    // );
    exportedVariablesExpression = t.nullLiteral();
    // bloomFilterExpression = t.numericLiteral(bloomFilter);
    bloomFilterExpression = null; // Not supported by React yet :(
  } else if (groups.length === 1) {
    const group = groups[0];
    const constantExportedVariables = t.objectExpression(
      group.values.map(({ name, value }) =>
        t.objectProperty(t.stringLiteral(name), t.stringLiteral(value))
      )
    );
    const exportedVariablesVariable = createTopLevelVariable(
      babel,
      path,
      "exportedCustomProperties",
      constantExportedVariables
    );
    exportedVariablesExpression =
      group.condition == null
        ? exportedVariablesVariable
        : t.conditionalExpression(
            buildCondition(babel, group.condition, environment),
            exportedVariablesVariable,
            t.nullLiteral()
          );
  } else {
    const exportedPropertiesVariable = createVariable(
      babel,
      path,
      "exportedCustomProperties",
      t.objectExpression([])
    );

    groups.forEach(({ condition, values }) => {
      const assignments = values.map(({ name, value }) =>
        t.expressionStatement(
          t.assignmentExpression(
            "=",
            t.memberExpression(
              exportedPropertiesVariable,
              t.stringLiteral(name),
              true /* computed */
            ),
            t.stringLiteral(value)
          )
        )
      );

      if (condition == null) {
        path.pushContainer("body", assignments);
      } else {
        path.pushContainer(
          "body",
          t.ifStatement(
            buildCondition(babel, condition, environment),
            t.blockStatement(assignments)
          )
        );
      }
    });

    exportedVariablesExpression = exportedPropertiesVariable;
  }

  const useCustomPropertiesImport = getOrCreateImport(
    babel,
    path,
    "cssta/runtime/useCustomProperties"
  );
  const customProperties = t.callExpression(
    useCustomPropertiesImport,
    bloomFilterExpression != null
      ? [exportedVariablesExpression, bloomFilterExpression]
      : [exportedVariablesExpression]
  );
  const customPropertiesVariable = createVariable(
    babel,
    path,
    "customProperties",
    customProperties
  );

  return customPropertiesVariable;
};

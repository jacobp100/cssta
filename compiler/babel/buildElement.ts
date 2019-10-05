import extractRules from "../css/extractRules";
import { StyleType } from "../css/types";
import extractCss from "./extractCss";
import createEnvironment from "./environment";
import styleSheet from "./styleSheet";
import style from "./style";
import useCustomProperties from "./useCustomProperties";
import useTransition from "./useTransition";
import useKeyframes from "./useKeyframes";
import useAnimation from "./useAnimation";
import returnElement from "./returnElement";
import forwardRefComponent from "./forwardRefComponent";
import { Options } from "./options";

export default (
  babel: any,
  nodePath: any,
  elementNode: any,
  cssNode: any,
  options?: Options
) => {
  const { cssText, substitutionMap } = extractCss(cssNode, options);
  const cssOutput = extractRules(cssText);
  const {
    propTypes,
    styles,
    transitions,
    animations,
    keyframes,
    exportedVariables
  } = cssOutput;

  const { path, propsVariable, refVariable } = forwardRefComponent(
    babel,
    nodePath,
    { propTypes }
  );

  const environment = createEnvironment(babel, path);

  const hasImportedVariables =
    styles.some(
      x => x.type === StyleType.Tuples && x.importedVariables.length !== 0
    ) ||
    transitions.some(x => x.importedVariables.length !== 0) ||
    animations.some(x => x.importedVariables.length !== 0) ||
    keyframes.some(x => x.importedVariables.length !== 0) ||
    exportedVariables.some(x => x.importedVariables.length !== 0);
  const hasExportedVariables = exportedVariables.length !== 0;

  if (hasExportedVariables && options != null && options.globals != null) {
    exportedVariables.forEach(({ name, value }) => {
      if (options.globals[name] != null) {
        throw new Error(
          `Attempted to overwrite global variable "${name}". Either change this variable, or remove it from the globals. See line \`--${name}: ${value}\``
        );
      }
    });
  }

  let customPropertiesVariable: any;
  if (hasImportedVariables || hasExportedVariables) {
    customPropertiesVariable = useCustomProperties(
      babel,
      path,
      cssOutput,
      environment
    );
  }

  const styleSheetRuleExpressions = styleSheet(
    babel,
    path,
    cssOutput,
    substitutionMap,
    environment,
    { customPropertiesVariable }
  );

  const willModifyStyle = transitions.length !== 0 || animations.length !== 0;
  const styleVariable = style(babel, path, environment, {
    propsVariable,
    styleSheetRuleExpressions,
    willModifyStyle
  });

  if (transitions.length !== 0) {
    useTransition(babel, path, cssOutput, environment, {
      styleVariable,
      customPropertiesVariable
    });
  }

  let keyframesVariable: any;
  if (keyframes.length !== 0) {
    keyframesVariable = useKeyframes(babel, path, cssOutput);
  }

  if (animations.length !== 0) {
    useAnimation(babel, path, cssOutput, environment, {
      styleVariable,
      keyframesVariable,
      customPropertiesVariable
    });
  }

  returnElement(babel, path, elementNode, options, {
    propsVariable,
    refVariable,
    styleVariable,
    hasExportedVariables,
    customPropertiesVariable
  });

  path.scope.crawl();
};

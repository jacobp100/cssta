import { getOrCreateImport } from "./util";
import { Options } from "../options";

const createBaseElement = (
  babel: any,
  path: any,
  element: any,
  { jsx, propsVariable, refVariable, styleVariable }
) => {
  const { types: t } = babel;
  if (!jsx) {
    const reactImport = getOrCreateImport(babel, path, "react");
    return t.callExpression(
      t.memberExpression(reactImport, t.identifier("createElement")),
      [
        element,
        t.objectExpression(
          [
            t.spreadElement(propsVariable),
            t.objectProperty(t.identifier("ref"), refVariable),
            styleVariable != null
              ? t.objectProperty(t.identifier("style"), styleVariable)
              : null,
          ].filter(Boolean)
        ),
      ]
    );
  } else {
    return t.jsxElement(
      t.jsxOpeningElement(
        t.jsxIdentifier(element.name),
        [
          t.jsxSpreadAttribute(propsVariable),
          t.jsxAttribute(
            t.jsxIdentifier("ref"),
            t.jsxExpressionContainer(refVariable)
          ),
          styleVariable != null
            ? t.jsxAttribute(
                t.jsxIdentifier("style"),
                t.jsxExpressionContainer(styleVariable)
              )
            : null,
        ].filter(Boolean),
        true
      ),
      null,
      []
    );
  }
};

const createVariablesExporter = (
  babel: any,
  path: any,
  baseElement: any,
  { jsx, customPropertiesVariable }
) => {
  const { types: t } = babel;
  const variablesContextImport = getOrCreateImport(
    babel,
    path,
    "cssta/runtime/VariablesContext"
  );

  if (!jsx) {
    const reactImport = getOrCreateImport(babel, path, "react");
    return t.callExpression(
      t.memberExpression(reactImport, t.identifier("createElement")),
      [
        t.memberExpression(variablesContextImport, t.identifier("Provider")),
        t.objectExpression([
          t.objectProperty(t.identifier("value"), customPropertiesVariable),
        ]),
        baseElement,
      ]
    );
  } else {
    const jsxProvider = t.jsxIdentifier(
      `${variablesContextImport.name}.Provider`
    );
    return t.jsxElement(
      t.jsxOpeningElement(
        jsxProvider,
        [
          t.jsxAttribute(
            t.jsxIdentifier("value"),
            t.jsxExpressionContainer(customPropertiesVariable)
          ),
        ],
        false
      ),
      t.jsxClosingElement(jsxProvider),
      [baseElement]
    );
  }
};

export default (
  babel: any,
  path: any,
  element: any,
  options: Options,
  {
    propsVariable,
    refVariable,
    styleVariable,
    hasExportedVariables,
    customPropertiesVariable,
  }
) => {
  const { types: t } = babel;
  const jsx = options != null && options.jsx;
  const baseElement = createBaseElement(babel, path, element, {
    jsx,
    propsVariable,
    refVariable,
    styleVariable,
  });
  const returned = hasExportedVariables
    ? createVariablesExporter(babel, path, baseElement, {
        jsx,
        customPropertiesVariable,
      })
    : baseElement;

  path.pushContainer("body", t.returnStatement(returned));
};

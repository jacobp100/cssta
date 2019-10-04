/* eslint-disable no-param-reassign */
import { getOrCreateImport } from "../util";
import unitTypes, { UnitType } from "./simpleUnitTypes";

const lengthInterpolation = (babel: any, path: any, value: any) => {
  const { types: t } = babel;
  if (
    t.isTemplateLiteral(value) &&
    value.quasis.length === 2 &&
    value.quasis[0].value.cooked === "" &&
    value.quasis[1].value.cooked === "px"
  ) {
    return t.callExpression(t.identifier("Number"), [value.expressions[0]]);
  } else {
    const transformRawValueImport = getOrCreateImport(
      babel,
      path,
      "cssta/runtime/cssUtil",
      "transformRawValue"
    );

    return t.callExpression(transformRawValueImport, [value]);
  }
};

const numberInterpolation = ({ types: t }: any, _path: any, value: any) =>
  t.callExpression(t.identifier("Number"), [value]);

const stringInterpolation = ({ types: t }: any, _path: any, value: any) =>
  t.callExpression(
    t.memberExpression(
      t.callExpression(t.identifier("String"), [value]),
      t.identifier("trim")
    ),
    []
  );

export default (babel: any, path: any, propName: string, substitution: any) => {
  switch (unitTypes[propName]) {
    case UnitType.Length:
      return lengthInterpolation(babel, path, substitution);
    case UnitType.Number:
      return numberInterpolation(babel, path, substitution);
    case UnitType.String:
      return stringInterpolation(babel, path, substitution);
    default:
      throw new Error("Not a simple unit");
  }
};

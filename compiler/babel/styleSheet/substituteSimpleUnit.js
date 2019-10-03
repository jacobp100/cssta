/* eslint-disable no-param-reassign */
const { getOrCreateImport } = require("../util");
const {
  TYPE_LENGTH,
  TYPE_NUMBER,
  TYPE_STRING,
  unitTypes
} = require("./simpleUnitTypes");

const convertValue = transform => ({ types: t }, path, value) =>
  t.callExpression(t.identifier(transform), [value]);

const lengthInterpolation = (babel, path, value) => {
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

const numberInterpolation = convertValue("Number");

const stringInterpolation = (babel, path, value) =>
  babel.types.callExpression(
    babel.types.memberExpression(
      convertValue("String")(babel, path, value),
      babel.types.identifier("trim")
    ),
    []
  );

module.exports = (babel, path, propName, substitution) => {
  switch (unitTypes[propName]) {
    case TYPE_LENGTH:
      return lengthInterpolation(babel, path, substitution);
    case TYPE_NUMBER:
      return numberInterpolation(babel, path, substitution);
    case TYPE_STRING:
      return stringInterpolation(babel, path, substitution);
    default:
      throw new Error("Not a simple unit");
  }
};

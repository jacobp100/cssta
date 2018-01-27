/* eslint-disable no-param-reassign */
const { getOrCreateImportReference } = require("../../util");

const convertValue = transform => ({ types: t }, path, value) =>
  t.callExpression(t.identifier(transform), [value]);

const stringInterpolation = (babel, path, value) =>
  babel.types.callExpression(
    babel.types.memberExpression(
      convertValue("String")(babel, path, value),
      babel.types.identifier("trim")
    ),
    []
  );

const lengthInterpolation = (babel, path, value) => {
  const transformRawValue = getOrCreateImportReference(
    babel,
    path,
    "cssta/lib/native/cssUtil",
    "transformRawValue"
  );

  return babel.types.callExpression(transformRawValue, [value]);
};

const numberInterpolation = convertValue("Number");

/*
All the values we can work out easily.

E.g.
fontSize: ${value} can only be a number -> { fontSize: Number(value) }
position: ${value} can only be a string -> { position: String(value).trim() }

Some values, like 'margin', have shorthands, so cannot be included.
*/
module.exports = {
  /* View */
  backfaceVisibility: stringInterpolation,
  background: stringInterpolation,
  backgroundColor: stringInterpolation,
  borderBottomColor: stringInterpolation,
  borderBottomLeftRadius: lengthInterpolation,
  borderBottomRightRadius: lengthInterpolation,
  borderBottomWidth: lengthInterpolation,
  borderLeftColor: stringInterpolation,
  borderLeftWidth: lengthInterpolation,
  borderRightColor: stringInterpolation,
  borderRightWidth: lengthInterpolation,
  borderTopColor: stringInterpolation,
  borderTopLeftRadius: lengthInterpolation,
  borderTopRightRadius: lengthInterpolation,
  borderTopWidth: lengthInterpolation,
  opacity: numberInterpolation,
  elevation: numberInterpolation,
  /* Layout */
  alignItems: stringInterpolation,
  alignSelf: stringInterpolation,
  bottom: lengthInterpolation,
  flexBasis: lengthInterpolation,
  flexDirection: stringInterpolation,
  flexGrow: numberInterpolation,
  flexShrink: numberInterpolation,
  flexWrap: stringInterpolation,
  height: lengthInterpolation,
  justifyContent: stringInterpolation,
  left: lengthInterpolation,
  marginBottomWidth: lengthInterpolation,
  marginLeftWidth: lengthInterpolation,
  marginRightWidth: lengthInterpolation,
  marginTopWidth: lengthInterpolation,
  maxHeight: lengthInterpolation,
  maxWidth: lengthInterpolation,
  minHeight: lengthInterpolation,
  minWidth: lengthInterpolation,
  overflow: stringInterpolation,
  paddingBottomWidth: lengthInterpolation,
  paddingLeftWidth: lengthInterpolation,
  paddingRightWidth: lengthInterpolation,
  paddingTopWidth: lengthInterpolation,
  position: stringInterpolation,
  right: lengthInterpolation,
  top: lengthInterpolation,
  width: lengthInterpolation,
  zIndex: numberInterpolation,
  /* Text */
  color: stringInterpolation,
  fontSize: lengthInterpolation,
  fontStyle: stringInterpolation,
  fontWeight: stringInterpolation,
  lineHeight: lengthInterpolation,
  textAlign: stringInterpolation,
  textDecorationLine: stringInterpolation,
  textShadowColor: stringInterpolation,
  textShadowRadius: lengthInterpolation,
  textAlignVertical: stringInterpolation,
  letterSpacing: lengthInterpolation,
  textDecorationColor: stringInterpolation,
  textDecorationStyle: stringInterpolation,
  writingDirection: stringInterpolation
};

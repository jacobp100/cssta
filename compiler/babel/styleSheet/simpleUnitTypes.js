const TYPE_LENGTH = 0;
const TYPE_NUMBER = 1;
const TYPE_STRING = 2;

module.exports.TYPE_LENGTH = TYPE_LENGTH;
module.exports.TYPE_NUMBER = TYPE_NUMBER;
module.exports.TYPE_STRING = TYPE_STRING;

/*
All the values we can work out easily.

E.g.
fontSize: ${value} can only be a number -> { fontSize: Number(value) }
position: ${value} can only be a string -> { position: String(value).trim() }

Some values, like 'margin', have shorthands, so cannot be included.
*/
module.exports.unitTypes = {
  /* View */
  backfaceVisibility: TYPE_STRING,
  background: TYPE_STRING,
  backgroundColor: TYPE_STRING,
  borderBottomColor: TYPE_STRING,
  borderBottomLeftRadius: TYPE_LENGTH,
  borderBottomRightRadius: TYPE_LENGTH,
  borderBottomWidth: TYPE_LENGTH,
  borderLeftColor: TYPE_STRING,
  borderLeftWidth: TYPE_LENGTH,
  borderRightColor: TYPE_STRING,
  borderRightWidth: TYPE_LENGTH,
  borderTopColor: TYPE_STRING,
  borderTopLeftRadius: TYPE_LENGTH,
  borderTopRightRadius: TYPE_LENGTH,
  borderTopWidth: TYPE_LENGTH,
  opacity: TYPE_NUMBER,
  elevation: TYPE_NUMBER,
  /* Layout */
  alignItems: TYPE_STRING,
  alignSelf: TYPE_STRING,
  bottom: TYPE_LENGTH,
  flexBasis: TYPE_LENGTH,
  flexDirection: TYPE_STRING,
  flexGrow: TYPE_NUMBER,
  flexShrink: TYPE_NUMBER,
  flexWrap: TYPE_STRING,
  height: TYPE_LENGTH,
  justifyContent: TYPE_STRING,
  left: TYPE_LENGTH,
  marginBottomWidth: TYPE_LENGTH,
  marginLeftWidth: TYPE_LENGTH,
  marginRightWidth: TYPE_LENGTH,
  marginTopWidth: TYPE_LENGTH,
  maxHeight: TYPE_LENGTH,
  maxWidth: TYPE_LENGTH,
  minHeight: TYPE_LENGTH,
  minWidth: TYPE_LENGTH,
  overflow: TYPE_STRING,
  paddingBottomWidth: TYPE_LENGTH,
  paddingLeftWidth: TYPE_LENGTH,
  paddingRightWidth: TYPE_LENGTH,
  paddingTopWidth: TYPE_LENGTH,
  position: TYPE_STRING,
  right: TYPE_LENGTH,
  top: TYPE_LENGTH,
  width: TYPE_LENGTH,
  zIndex: TYPE_NUMBER,
  /* Text */
  color: TYPE_STRING,
  fontSize: TYPE_LENGTH,
  fontStyle: TYPE_STRING,
  fontWeight: TYPE_STRING,
  lineHeight: TYPE_LENGTH,
  textAlign: TYPE_STRING,
  textDecorationLine: TYPE_STRING,
  textShadowColor: TYPE_STRING,
  textShadowRadius: TYPE_LENGTH,
  textAlignVertical: TYPE_STRING,
  letterSpacing: TYPE_LENGTH,
  textDecorationColor: TYPE_STRING,
  textDecorationStyle: TYPE_STRING,
  writingDirection: TYPE_STRING
};

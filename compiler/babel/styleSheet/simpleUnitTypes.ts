export enum UnitType {
  Length,
  Number,
  String,
}

/*
All the values we can work out easily.

E.g.
fontSize: ${value} can only be a number -> { fontSize: Number(value) }
position: ${value} can only be a string -> { position: String(value).trim() }

Some values, like 'margin', have shorthands, so cannot be included.
*/
export default {
  /* View */
  backfaceVisibility: UnitType.String,
  background: UnitType.String,
  backgroundColor: UnitType.String,
  borderBottomColor: UnitType.String,
  borderBottomLeftRadius: UnitType.Length,
  borderBottomRightRadius: UnitType.Length,
  borderBottomWidth: UnitType.Length,
  borderLeftColor: UnitType.String,
  borderLeftWidth: UnitType.Length,
  borderRightColor: UnitType.String,
  borderRightWidth: UnitType.Length,
  borderTopColor: UnitType.String,
  borderTopLeftRadius: UnitType.Length,
  borderTopRightRadius: UnitType.Length,
  borderTopWidth: UnitType.Length,
  opacity: UnitType.Number,
  elevation: UnitType.Number,
  /* Layout */
  alignItems: UnitType.String,
  alignSelf: UnitType.String,
  bottom: UnitType.Length,
  flexBasis: UnitType.Length,
  flexDirection: UnitType.String,
  flexGrow: UnitType.Number,
  flexShrink: UnitType.Number,
  flexWrap: UnitType.String,
  height: UnitType.Length,
  justifyContent: UnitType.String,
  left: UnitType.Length,
  marginBottom: UnitType.Length,
  marginLeft: UnitType.Length,
  marginRight: UnitType.Length,
  marginTop: UnitType.Length,
  maxHeight: UnitType.Length,
  maxWidth: UnitType.Length,
  minHeight: UnitType.Length,
  minWidth: UnitType.Length,
  overflow: UnitType.String,
  paddingBottom: UnitType.Length,
  paddingLeft: UnitType.Length,
  paddingRight: UnitType.Length,
  paddingTop: UnitType.Length,
  position: UnitType.String,
  right: UnitType.Length,
  top: UnitType.Length,
  width: UnitType.Length,
  zIndex: UnitType.Number,
  /* Text */
  color: UnitType.String,
  fontSize: UnitType.Length,
  fontStyle: UnitType.String,
  fontWeight: UnitType.String,
  lineHeight: UnitType.Length,
  textAlign: UnitType.String,
  textDecorationLine: UnitType.String,
  textShadowColor: UnitType.String,
  textShadowRadius: UnitType.Length,
  textAlignVertical: UnitType.String,
  letterSpacing: UnitType.Length,
  textDecorationColor: UnitType.String,
  textDecorationStyle: UnitType.String,
  writingDirection: UnitType.String,
};

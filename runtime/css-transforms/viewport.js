// @flow
/*
CAUTION!

This file could be included even after running the babel plugin.

Make sure you don't import large libraries.
*/
const { viewportUnitRegExp } = require("../cssRegExp");

module.exports = (
  value /*: string */,
  { width, height } /*: { width: number, height: number } */
) /*: string */ =>
  value.replace(viewportUnitRegExp, (m, value, unit) => {
    switch (unit) {
      case "vw":
        return Number(value) * width + "px";
      case "vh":
        return Number(value) * height + "px";
      case "vmin":
        return Number(value) * Math.min(width, height) + "px";
      case "vmax":
        return Number(value) * Math.max(width, height) + "px";
      default:
        return m;
    }
  });

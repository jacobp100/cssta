const { varRegExp } = require("./cssRegExp");

/* eslint-disable no-prototype-builtins */

module.exports = (
  scope /*: { [string]: string | null } */,
  next /*: { [string]: string | null } */
) /*: { [string]: string | null } */ => {
  const out = {};

  /*
  Used to check for circular dependencies when calling resolve
  We can actully use one mutable value here, even though the function is recursive
  */
  const resolveChain = [];

  const resolve = key => {
    if (out.hasOwnProperty(key)) return out[key];

    let unresolvedValue;
    if (next.hasOwnProperty(key)) {
      const value = next[key];
      if (value === "initial") {
        unresolvedValue = null;
      } else if (value === "inherit" || value === "unset") {
        unresolvedValue = scope[key];
      } else {
        unresolvedValue = value;
      }
    } else if (scope.hasOwnProperty(key)) {
      unresolvedValue = scope[key];
    } else {
      /*
      We're trying to resolve a reference that doesn't exist in the scope or parent
      Return early here to avoid adding this missing reference to `out`
      */
      return null;
    }

    if (unresolvedValue == null) {
      out[key] = null;
      return null;
    }

    const chainIndex = resolveChain.indexOf(key);
    if (chainIndex !== -1) {
      const circularLoop = resolveChain
        .slice(chainIndex)
        .concat(key)
        .join(" -> ");
      throw new Error(
        `Circular dependency found in CSS custom properties: ${circularLoop}`
      );
    }

    resolveChain.push(key);

    let missingValues = false;
    let resolvedValue = unresolvedValue.replace(
      varRegExp,
      (m, reference, fallback) => {
        const resolved = resolve(reference);
        if (resolved != null) {
          return resolved;
        } else if (fallback != null) {
          return fallback;
        } else {
          missingValues = true;
          return "";
        }
      }
    );
    if (missingValues) resolvedValue = null;

    out[key] = resolvedValue;

    resolveChain.pop();

    return resolvedValue;
  };

  Object.keys(scope).forEach(resolve);
  Object.keys(next).forEach(resolve);

  return out;
};

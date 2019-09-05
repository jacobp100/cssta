// @flow
const { varRegExp } = require("./cssRegExp");

/*::
import type { Variables } from "./VariablesContext";
*/

/* eslint-disable no-prototype-builtins */

module.exports = (
  scope /*: Variables */,
  next /*: Variables */
) /*: Variables */ => {
  const out = {};

  /*
  Used to check for circular dependencies when calling resolve
  We can actully use one mutable value here, even though the function is recursive
  */
  const resolveChain = [];

  const resolve = key => {
    const existing = out[key];
    if (existing != null) return existing;

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
      unresolvedValue = null;
    }

    if (unresolvedValue == null) return undefined;

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

    if (!missingValues) {
      out[key] = resolvedValue;
    }

    resolveChain.pop();

    return resolvedValue;
  };

  Object.keys(scope).forEach(resolve);
  Object.keys(next).forEach(resolve);

  return out;
};

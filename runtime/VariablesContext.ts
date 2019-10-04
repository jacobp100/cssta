import { createContext } from "react";

export type Variables = Record<string, string>;

/*
When react supports this, we can enable it
const { keyBloom } = require("./bloomFilter");

const diff = (prev, current) => {
  let bloom = 0;
  for (const key in prev) {
    if (!current.hasOwnProperty(key) || prev[key] !== current[key]) {
      bloom |= keyBloom(key);
    }
  }
  for (const key in current) {
    if (!prev.hasOwnProperty(key)) {
      bloom |= keyBloom(key);
    }
  }
  return bloom;
}
*/

export default createContext(/*:: <Variables> */ {});

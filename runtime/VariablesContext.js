// @flow
const React = require("react");

/*::
export type Variables = { [key: string]: string };
*/

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

module.exports = React.createContext/*:: <Variables> */({});

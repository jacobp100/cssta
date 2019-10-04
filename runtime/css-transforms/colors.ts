import { convert } from "css-color-function";

const colorFnRe = /color\((?:[^()]+|\([^)]+\))+\)/g;

export default (value: string): string => value.replace(colorFnRe, convert);

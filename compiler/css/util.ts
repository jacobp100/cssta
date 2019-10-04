import { Node } from "postcss";

export const keyframesRegExp = /keyframes$/i;
export const isDirectChildOfKeyframes = (node: Node): boolean =>
  node.parent &&
  node.parent.type === "atrule" &&
  keyframesRegExp.test(node.parent.name);

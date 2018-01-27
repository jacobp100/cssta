// @flow

const keyframesRegExp = /keyframes$/i;
module.exports.keyframesRegExp = keyframesRegExp;
module.exports.isDirectChildOfKeyframes = (node /*: Object */) /*: boolean */ =>
  node.parent &&
  node.parent.type === "atrule" &&
  keyframesRegExp.test(node.parent.name);

// @flow
module.exports.keyBloom = key => 1 << key.charCodeAt(0) % 31;

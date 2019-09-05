// @flow
module.exports.keyBloom = (key /*: string */) => 1 << key.charCodeAt(0) % 31;

// @flow
const enhancerFactory = require("../factories/enhancerFactory");
const createComponent = require("./createComponent");

module.exports = enhancerFactory(createComponent);

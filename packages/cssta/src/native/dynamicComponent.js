const dynamicComponentFactory = require('../factories/dynamicComponentFactory');
const staticComponentTransform = require('./staticComponentTransform');

module.exports = dynamicComponentFactory(staticComponentTransform);

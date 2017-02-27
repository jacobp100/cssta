const staticComponentFactory = require('../factories/staticComponentFactory');
const staticComponentTransform = require('./staticComponentTransform');

module.exports = staticComponentFactory(staticComponentTransform);

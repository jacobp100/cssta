const dynamicComponentFactory = require('../../factories/dynamicComponentFactory');
const staticComponentTransform = require('../staticComponentTransform');
/* eslint-disable no-param-reassign */

module.exports = dynamicComponentFactory(staticComponentTransform);

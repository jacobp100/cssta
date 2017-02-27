'use strict';

var staticComponentFactory = require('../factories/staticComponentFactory');
var staticComponentTransform = require('./staticComponentTransform');

module.exports = staticComponentFactory(staticComponentTransform);
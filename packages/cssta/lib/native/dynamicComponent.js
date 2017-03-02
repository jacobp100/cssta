'use strict';

var dynamicComponentFactory = require('../factories/dynamicComponentFactory');
var staticComponentTransform = require('./staticComponentTransform');

module.exports = dynamicComponentFactory(function (ownProps, passedProps, args) {
  return staticComponentTransform(ownProps, passedProps, args.rules);
});
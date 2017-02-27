const dynamicComponentFactory = require('../factories/dynamicComponentFactory');
const staticComponentTransform = require('./staticComponentTransform');

module.exports = dynamicComponentFactory((ownProps, passedProps, args) => (
  staticComponentTransform(ownProps, passedProps, args.rules)
));

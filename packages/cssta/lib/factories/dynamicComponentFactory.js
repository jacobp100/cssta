'use strict';

var React = require('react');

var _require = require('../util/props'),
    getOwnPropKeys = _require.getOwnPropKeys,
    getComponentProps = _require.getComponentProps,
    getPropTypes = _require.getPropTypes;

var mergeTransformers = function mergeTransformers(enhancers, EndNode) {
  return enhancers.reduceRight(function (NextElement, CurrentElement) {
    return function (props) {
      return React.createElement(CurrentElement, props, NextElement);
    };
  }, EndNode);
};

var nextCacheNode = function nextCacheNode(node, transform) {
  if (!node.has(transform)) node.set(transform, new Map());
  return node.get(transform);
};

var LEAF = 'leaf';
var mergeTransformersCached = function mergeTransformersCached(getTransformer, enhancers, cache) {
  var cacheEntry = enhancers.reduce(nextCacheNode, cache);

  if (!cacheEntry.has(LEAF)) cacheEntry.set(LEAF, getTransformer(enhancers));
  return cacheEntry.get(LEAF);
};

module.exports = function (transformProps) {
  var cache = new Map();

  var EndNode = function EndNode(_ref) {
    var Element = _ref.Element,
        ownProps = _ref.ownProps,
        passedProps = _ref.passedProps,
        args = _ref.args;
    return React.createElement(Element, transformProps(ownProps, passedProps, args));
  };

  var getTransformer = function getTransformer(enhancers) {
    return mergeTransformers(enhancers, EndNode);
  };

  return function (component, propTypes, enhancers, args) {
    var RootComponent = mergeTransformersCached(getTransformer, enhancers, cache);
    var ownPropKeys = getOwnPropKeys(propTypes);

    var DynamicComponent = function DynamicComponent(props) {
      var _getComponentProps = getComponentProps(ownPropKeys, component, props),
          Element = _getComponentProps.Element,
          ownProps = _getComponentProps.ownProps,
          passedProps = _getComponentProps.passedProps;

      var nextProps = { Element: Element, ownProps: ownProps, passedProps: passedProps, args: args };
      return React.createElement(RootComponent, nextProps);
    };

    if (process.env.NODE_ENV !== 'production' && !Array.isArray(propTypes)) {
      DynamicComponent.propTypes = getPropTypes(ownPropKeys, propTypes);
    }

    return DynamicComponent;
  };
};
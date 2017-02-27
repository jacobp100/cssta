const React = require('react');
const { getOwnPropKeys, getComponentProps, getPropTypes } = require('../util/props');

const mergeTransformers = enhancers =>
  enhancers.reduceRight((NextElement, CurrentElement) => (
    props => React.createElement(CurrentElement, props, NextElement)
  ));

const nextCacheNode = (node, transform) => {
  if (!node.has(transform)) node.set(transform, new Map());
  return node.get(transform);
};

const managerCache = new Map();
const LEAF = 'leaf';

const mergeTransformersCached = (enhancers, transformProps) => {
  let cacheEntry = enhancers.reduce(nextCacheNode, managerCache);
  cacheEntry = nextCacheNode(cacheEntry, transformProps);

  if (!cacheEntry.has(LEAF)) {
    cacheEntry.set(LEAF, mergeTransformers(enhancers));
  }
  return cacheEntry.get(LEAF);
};

module.exports = transformProps => (component, propTypes, enhancers, args) => {
  const RootComponent = mergeTransformersCached(enhancers, transformProps);
  const ownPropKeys = getOwnPropKeys(propTypes);

  const DynamicComponent = (props) => {
    const { Element, ownProps, passedProps } = getComponentProps(ownPropKeys, component, props);
    const nextProps = { Element, ownProps, passedProps, args };
    return React.createElement(RootComponent, nextProps);
  };

  if (process.env.NODE_ENV !== 'production' && !Array.isArray(propTypes)) {
    DynamicComponent.propTypes = getPropTypes(ownPropKeys, propTypes);
  }

  return DynamicComponent;
};

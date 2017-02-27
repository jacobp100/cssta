const React = require('react');
const { getOwnPropKeys, getComponentProps, getPropTypes } = require('../util/props');

const mergeTransformers = (enhancers, EndNode) =>
  enhancers.reduceRight((NextElement, CurrentElement) => (
    props => React.createElement(CurrentElement, props, NextElement)
  ), EndNode);

const nextCacheNode = (node, transform) => {
  if (!node.has(transform)) node.set(transform, new Map());
  return node.get(transform);
};

const LEAF = 'leaf';
const mergeTransformersCached = (getTransformer, enhancers, cache) => {
  const cacheEntry = enhancers.reduce(nextCacheNode, cache);

  if (!cacheEntry.has(LEAF)) cacheEntry.set(LEAF, getTransformer(enhancers));
  return cacheEntry.get(LEAF);
};

module.exports = (transformProps) => {
  const cache = new Map();

  const EndNode = ({ Element, ownProps, passedProps, args }) =>
    React.createElement(Element, transformProps(ownProps, passedProps, args));

  const getTransformer = enhancers => mergeTransformers(enhancers, EndNode);

  return (component, propTypes, enhancers, args) => {
    const RootComponent = mergeTransformersCached(getTransformer, enhancers, cache);
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
};

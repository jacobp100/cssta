// @flow
const React = require('react');
/*:: import type { ComponentFactory, ComponentPropTypes, Props, Enhancer } from './types' */

const mergeTransformers = (enhancers, EndNode) =>
  enhancers.reduceRight((NextElement, CurrentElement) /*: any */ => (
    props => React.createElement(CurrentElement, props, NextElement)
  ), EndNode);

const nextCacheNode = (node, transform) /*: any */ => {
  let value = node.get(transform);

  if (!value) {
    value = new Map();
    node.set(transform, value);
  }

  return value;
};

const LEAF = 'leaf';
const mergeTransformersCached = (getTransformer, enhancers, cache) /*: any */ => {
  const cacheEntry = enhancers.reduce(nextCacheNode, cache);

  let value = cacheEntry.get(LEAF);

  if (!value) {
    value = getTransformer(enhancers);
    cacheEntry.set(LEAF, value);
  }

  return value;
};

module.exports = (constructor /*: ComponentFactory */) => {
  const cache = new Map();

  return (enhancers /*: Enhancer[] */) => (
    component /*: any */,
    propTypes /*: ComponentPropTypes */,
    args /*: any */
  ) => constructor(component, propTypes, args, (EndNode) => {
    const RootNode = mergeTransformersCached(
      passedEnhancers => mergeTransformers(passedEnhancers, EndNode),
      enhancers,
      cache
    );
    const render = props => React.createElement(RootNode, props);
    return render;
  });
};

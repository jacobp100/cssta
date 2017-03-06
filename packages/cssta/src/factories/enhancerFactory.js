const React = require('react');

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

module.exports = (constructor) => {
  const cache = new Map();

  return enhancers => (...args) => constructor(...args, (EndNode) => {
    const RootNode = mergeTransformersCached(
      passedEnhancers => mergeTransformers(passedEnhancers, EndNode),
      enhancers,
      cache
    );
    const render = props => React.createElement(RootNode, props);
    return render;
  });
};

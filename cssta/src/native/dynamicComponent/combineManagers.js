const React = require('react');
const { getOwnPropKeys, getComponentProps, getPropTypes } = require('../../util');
/* eslint-disable no-param-reassign */

/*
type Rule = {
  validate: Props => boolean,
  styleTuples: ([StyleProperty, string])[],
  exportedVariables: { [key:StyleVariableName]: string },
};
*/

/*
UntransformedStyles
  * Empty from variables manager
  * `rules` from any other config

TransformedStyles
  * Stylesheet from variables manager
  * Animated from transition manager
  * Also user styles
*/

/*
type CoreProps = {
  Element: React.Component,
  ownProps: Object,
  passedProps: Object,
  managerArgs: Object,
};

type WithNextElement = { NextElement: React.Component };

type StyleSheetManagerTransformedProps = {
  ...CoreProps,
  stylesheet: Rule[],
};
type StyleSheetProps = {
  ...WithNextElement,
  ...StyleSheetManagerTransformedProps,
  rules: Rule[],
}

type BaseTransformedProps = {
  ...CoreProps,
  appliedRules: Rule[],
};
type BaseProps = {
  ...WithNextElement,
  ...BaseTransformedProps
};

type StyleSheetManager = StyleSheetProps =>
  React.Component<NextElement, StyleSheetManagerTransformedProps, void>;

type Transform = BaseProps =>
  React.Component<NextElement, BaseTransformedProps, void>;
*/

const ElementWrapper = ({ Element, passedProps, appliedRules }) => {
  let style = appliedRules.map(rule => rule.styleSheetReference || rule.style);

  if ('style' in passedProps) style = style.concat(passedProps.style);
  if (style.length > 0) passedProps.style = style;

  return React.createElement(Element, passedProps);
};

// TODO: Cache the result of this
const mergeTransformers = (StyleSheetManager, transforms) => {
  const TransformWithAppliedRules = transforms.reduceRight((NextElement, CurrentElement) => (
    props => React.createElement(CurrentElement, Object.assign({ NextElement }, props))
  ), ElementWrapper);

  const TransformStyleSheetManager = ({ Element, ownProps, passedProps, managerArgs, rules }) => {
    const appliedRules = rules.filter(rule => rule.validate(ownProps));
    // NextElement already handled
    const nextProps = { Element, ownProps, passedProps, appliedRules, managerArgs };
    return React.createElement(TransformWithAppliedRules, nextProps);
  };

  return props => React.createElement(
    StyleSheetManager,
    Object.assign({ NextElement: TransformStyleSheetManager }, props)
  );
};

const managerCache = new Map();
const LEAF = 'leaf';

const nextCacheNode = (node, transform) => {
  if (!node.has(transform)) node.set(transform, new Map());
  return node.get(transform);
};

const mergeTransformersCached = (StyleSheetManager, transforms) => {
  const cacheEntry = transforms.reduce(
    nextCacheNode,
    nextCacheNode(managerCache, StyleSheetManager)
  );

  if (!cacheEntry.has(LEAF)) {
    cacheEntry.set(LEAF, mergeTransformers(StyleSheetManager, transforms));
  }
  return cacheEntry.get(LEAF);
};

module.exports = (StyleSheetManager, transforms) => {
  const RootComponent = mergeTransformersCached(StyleSheetManager, transforms);

  return (component, propTypes, managerArgs, rules) => {
    const ownPropKeys = getOwnPropKeys(propTypes);

    const DynamicComponent = (props) => {
      const { Element, ownProps, passedProps } = getComponentProps(ownPropKeys, component, props);
      const nextProps = { Element, ownProps, passedProps, managerArgs, rules };
      return React.createElement(RootComponent, nextProps);
    };

    if (process.env.NODE_ENV !== 'production' && !Array.isArray(propTypes)) {
      DynamicComponent.propTypes = getPropTypes(ownPropKeys, propTypes);
    }

    return DynamicComponent;
  };
};

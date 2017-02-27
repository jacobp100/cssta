'use strict';

var React = require('react');

var _require = require('../../util'),
    getOwnPropKeys = _require.getOwnPropKeys,
    getComponentProps = _require.getComponentProps,
    getPropTypes = _require.getPropTypes;
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

var ElementWrapper = function ElementWrapper(_ref) {
  var Element = _ref.Element,
      passedProps = _ref.passedProps,
      appliedRules = _ref.appliedRules;

  var style = appliedRules.map(function (rule) {
    return rule.styleSheetReference || rule.style;
  });

  if ('style' in passedProps) style = style.concat(passedProps.style);
  if (style.length > 0) passedProps.style = style;

  return React.createElement(Element, passedProps);
};

// TODO: Cache the result of this
var mergeTransformers = function mergeTransformers(StyleSheetManager, transforms) {
  var TransformWithAppliedRules = transforms.reduceRight(function (NextElement, CurrentElement) {
    return function (props) {
      return React.createElement(CurrentElement, Object.assign({ NextElement: NextElement }, props));
    };
  }, ElementWrapper);

  var TransformStyleSheetManager = function TransformStyleSheetManager(_ref2) {
    var Element = _ref2.Element,
        ownProps = _ref2.ownProps,
        passedProps = _ref2.passedProps,
        managerArgs = _ref2.managerArgs,
        rules = _ref2.rules;

    var appliedRules = rules.filter(function (rule) {
      return rule.validate(ownProps);
    });
    // NextElement already handled
    var nextProps = { Element: Element, ownProps: ownProps, passedProps: passedProps, appliedRules: appliedRules, managerArgs: managerArgs };
    return React.createElement(TransformWithAppliedRules, nextProps);
  };

  return function (props) {
    return React.createElement(StyleSheetManager, Object.assign({ NextElement: TransformStyleSheetManager }, props));
  };
};

var managerCache = new Map();
var LEAF = 'leaf';

var nextCacheNode = function nextCacheNode(node, transform) {
  if (!node.has(transform)) node.set(transform, new Map());
  return node.get(transform);
};

var mergeTransformersCached = function mergeTransformersCached(StyleSheetManager, transforms) {
  var cacheEntry = transforms.reduce(nextCacheNode, nextCacheNode(managerCache, StyleSheetManager));

  if (!cacheEntry.has(LEAF)) {
    cacheEntry.set(LEAF, mergeTransformers(StyleSheetManager, transforms));
  }
  return cacheEntry.get(LEAF);
};

module.exports = function (StyleSheetManager, transforms) {
  var RootComponent = mergeTransformersCached(StyleSheetManager, transforms);

  return function (component, propTypes, managerArgs, rules) {
    var ownPropKeys = getOwnPropKeys(propTypes);

    var DynamicComponent = function DynamicComponent(props) {
      var _getComponentProps = getComponentProps(ownPropKeys, component, props),
          Element = _getComponentProps.Element,
          ownProps = _getComponentProps.ownProps,
          passedProps = _getComponentProps.passedProps;

      var nextProps = { Element: Element, ownProps: ownProps, passedProps: passedProps, managerArgs: managerArgs, rules: rules };
      return React.createElement(RootComponent, nextProps);
    };

    if (process.env.NODE_ENV !== 'production' && !Array.isArray(propTypes)) {
      DynamicComponent.propTypes = getPropTypes(ownPropKeys, propTypes);
    }

    return DynamicComponent;
  };
};
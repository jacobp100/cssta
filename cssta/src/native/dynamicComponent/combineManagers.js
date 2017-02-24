const React = require('react');
/* eslint-disable */
const { StyleSheet } = require('react-native');
/* eslint-enable */
const { getOwnPropKeys, getComponentProps, getPropTypes } = require('../../util');
/* eslint-disable no-param-reassign */

const { Component } = React;

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
  let style = appliedRules.map(rule => rule.style);

  if ('style' in passedProps) style = style.concat(passedProps.style);
  if (style.length > 0) passedProps.style = style;

  return React.createElement(Element, passedProps);
};

// TODO: Cache the result of this
const mergeTransformers = (StyleSheetManager, transforms) => {
  const TransformWithAppliedRules = transforms.reduceRight((ChildElement, CurrentElement) => (
    props => React.createElement(CurrentElement, props, ChildElement)
  ), ElementWrapper);

  return ({ Element, ownProps, passedProps, stylesheet, managerArgs }) => {
    const appliedRules = stylesheet.filter(rule => rule.validate(ownProps));
    const nextProps = { Element, ownProps, passedProps, appliedRules, managerArgs };
    return React.createElement(StyleSheetManager, nextProps, TransformWithAppliedRules);
  };
};

module.exports = (StyleSheetManager, transforms) => {
  const RootComponent = mergeTransformers(StyleSheet, transforms);

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

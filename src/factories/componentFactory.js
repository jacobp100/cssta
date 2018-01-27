// @flow
/*
CAUTION!

This file could be included even after running the babel plugin.

Make sure you don't import large libraries.
*/
/* eslint-disable no-param-reassign */
const React = require("react");
const PropTypes = require("prop-types");
/*:: import type { ComponentFactory, Props, EnhancerConstructor } from './types' */

const getOwnPropKeys = propTypes =>
  Array.isArray(propTypes) ? propTypes : Object.keys(propTypes);

const getComponentProps = (ownPropKeys, component, props) =>
  Object.keys(props).reduce(
    (accum, key) => {
      const prop = props[key];

      if (key === "component") {
        accum.Element = prop;
      } else if (key === "innerRef") {
        accum.passedProps.ref = prop;
      } else if (ownPropKeys.indexOf(key) !== -1) {
        accum.ownProps[key] = prop;
      } else {
        accum.passedProps[key] = prop;
      }

      return accum;
    },
    { Element: component, ownProps: {}, passedProps: {} }
  );

let getPropTypes;
if (process.env.NODE_ENV !== "production") {
  getPropTypes = (ownPropKeys, propTypes) =>
    ownPropKeys.reduce(
      (out, key) => {
        const styleMap = propTypes[key];
        const propType = styleMap.type;

        if (propType === "oneOf") {
          out[key] = PropTypes.oneOf(styleMap.values);
        } else if (propType === "bool") {
          out[key] = PropTypes.bool;
        }

        return out;
      },
      { component: PropTypes.oneOfType([PropTypes.string, PropTypes.func]) }
    );
}

module.exports = (
  transformProps /*: (ownProps: Object, passedProps: Object, args: any) => Object */
) /*: ComponentFactory */ => {
  const baseRender = ({ Element, ownProps, passedProps, args }) =>
    React.createElement(Element, transformProps(ownProps, passedProps, args));

  return (component, propTypes, args, enhancer) => {
    const render = enhancer ? enhancer(baseRender) : baseRender;
    const ownPropKeys = getOwnPropKeys(propTypes);

    const StaticComponent = (props /*: Object */) => {
      const { Element, ownProps, passedProps } = getComponentProps(
        ownPropKeys,
        component,
        props
      );
      return render({ Element, ownProps, passedProps, args });
    };

    if (process.env.NODE_ENV !== "production" && !Array.isArray(propTypes)) {
      StaticComponent.propTypes = getPropTypes(ownPropKeys, propTypes);
    }

    return StaticComponent;
  };
};

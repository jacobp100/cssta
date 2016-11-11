/* eslint-disable no-param-reassign */
const React = require('react');

const { PropTypes } = React;

module.exports = transformProps => (component, propTypes, ...otherParams) => {
  const ownPropKeys = Array.isArray(propTypes) ? propTypes : Object.keys(propTypes);

  const Component = (props) => {
    const { Element, ownProps, passedProps } = Object.keys(props).reduce((accum, key) => {
      const prop = props[key];

      if (key === 'component') {
        accum.Element = prop;
      } else if (ownPropKeys.indexOf(key) !== -1) {
        accum.ownProps[key] = prop;
      } else {
        accum.passedProps[key] = prop;
      }

      return accum;
    }, {
      Element: component,
      ownProps: {},
      passedProps: {},
    });

    return React.createElement(Element, transformProps(ownProps, passedProps, ...otherParams));
  };

  if (process.env.NODE_ENV !== 'production' && !Array.isArray(propTypes)) {
    Component.propTypes = ownPropKeys.reduce((out, key) => {
      const styleMap = propTypes[key];
      const propType = styleMap.type;

      if (propType === 'oneOf') {
        out[key] = PropTypes.oneOf(styleMap.values);
      } else if (propType === 'bool') {
        out[key] = PropTypes.bool;
      }

      return out;
    }, {
      component: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.function,
      ]),
    });
  }

  return Component;
};

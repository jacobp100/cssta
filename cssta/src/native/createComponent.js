/* eslint-disable no-param-reassign */
const React = require('react');

const { PropTypes } = React;

module.exports = (component, rules, propTypes) => {
  const ownProps = Array.isArray(propTypes) ? propTypes : Object.keys(propTypes);

  const Component = (props) => {
    const { Element, passedProps } = Object.keys(props).reduce((accum, key) => {
      const prop = props[key];

      if (key === 'component') {
        accum.Element = prop;
      } else if (key !== 'style' && ownProps.indexOf(key) === -1) {
        accum.passedProps[key] = prop;
      }

      return accum;
    }, {
      Element: component,
      passedProps: {},
    });

    let style = rules
      .filter(rule => rule.validate(props))
      .map(rule => rule.style);

    if ('style' in props) style = style.concat(props.style); // eslint-disable-line

    passedProps.style = style;

    return React.createElement(Element, passedProps);
  };

  if (process.env.NODE_ENV !== 'production' && !Array.isArray(propTypes)) {
    Component.propTypes = ownProps.reduce((out, key) => {
      const styleMap = propTypes[key];

      if (Array.isArray(styleMap)) {
        out[key] = PropTypes.oneOf(styleMap);
      } else if (styleMap === 'bool') {
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

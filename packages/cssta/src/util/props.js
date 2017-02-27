/* eslint-disable no-param-reassign */
const React = require('react');

const { PropTypes } = React;

module.exports.getOwnPropKeys = propTypes =>
  (Array.isArray(propTypes) ? propTypes : Object.keys(propTypes));

module.exports.getComponentProps = (ownPropKeys, component, props) => (
  Object.keys(props).reduce((accum, key) => {
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
  })
);

if (process.env.NODE_ENV !== 'production') {
  module.exports.getPropTypes = (ownPropKeys, propTypes) => ownPropKeys.reduce((out, key) => {
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

/* eslint-disable no-param-reassign */
const React = require('react');
const { getOwnPropKeys, getComponentProps, getPropTypes } = require('../util/props');


module.exports = transformProps => (component, propTypes, ...otherParams) => {
  const ownPropKeys = getOwnPropKeys(propTypes);

  const StaticComponent = (props) => {
    const { Element, ownProps, passedProps } = getComponentProps(ownPropKeys, component, props);
    return React.createElement(Element, transformProps(ownProps, passedProps, ...otherParams));
  };

  if (process.env.NODE_ENV !== 'production' && !Array.isArray(propTypes)) {
    StaticComponent.propTypes = getPropTypes(ownPropKeys, propTypes);
  }

  return StaticComponent;
};

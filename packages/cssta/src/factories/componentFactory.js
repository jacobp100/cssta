/* eslint-disable no-param-reassign */
const React = require('react');
const { getOwnPropKeys, getComponentProps, getPropTypes } = require('../util/props');


module.exports = (transformProps) => {
  const baseRender = ({ Element, ownProps, passedProps, args }) =>
    React.createElement(Element, transformProps(ownProps, passedProps, args));

  return (component, propTypes, args, enhancer) => {
    const render = enhancer ? enhancer(baseRender) : baseRender;
    const ownPropKeys = getOwnPropKeys(propTypes);

    const StaticComponent = (props) => {
      const { Element, ownProps, passedProps } = getComponentProps(ownPropKeys, component, props);
      return render({ Element, ownProps, passedProps, args });
    };

    if (process.env.NODE_ENV !== 'production' && !Array.isArray(propTypes)) {
      StaticComponent.propTypes = getPropTypes(ownPropKeys, propTypes);
    }

    return StaticComponent;
  };
};

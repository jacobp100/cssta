/* eslint-disable no-param-reassign */
const React = require('react');

const { PropTypes } = React;

/*
classNameMap:
{
  stringAttributeName: {
    stringAttributeValue1: 'class1',
    stringAttributeValue2: 'class2',
  },
  booleanAttributeName: 'classWhenBooleanValueIsTrue',
}
*/

module.exports = (component, baseClassName, classNameMap) => {
  const ownProps = Object.keys(classNameMap);

  const Component = (props) => {
    const { Element, classNames, passedProps } = Object.keys(props).reduce((accum, key) => {
      const prop = props[key];

      if (key === 'component') {
        accum.Element = prop;
      } else if (key === 'className') {
        accum.classNames.push(prop);
      } else if (ownProps.indexOf(key) !== -1) {
        const className = typeof prop === 'boolean'
          ? classNameMap[key]
          : classNameMap[key][prop];
        accum.classNames.push(className);
      } else {
        accum.passedProps[key] = prop;
      }

      return accum;
    }, {
      Element: component,
      classNames: [baseClassName],
      passedProps: {},
    });

    const className = classNames.join(' ').trim();

    if (className) passedProps.className = className;

    return React.createElement(Element, passedProps);
  };

  if (process.env.NODE_ENV !== 'production') {
    Component.propTypes = ownProps.reduce((out, key) => {
      const styleMap = classNameMap[key];

      if (typeof styleMap === 'string') {
        out[key] = PropTypes.bool;
      } else if (styleMap && typeof styleMap === 'object') {
        const allowedValues = Object.keys(styleMap);
        out[key] = PropTypes.oneOf(allowedValues);
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

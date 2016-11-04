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
      Element: null,
      classNames: [baseClassName],
      passedProps: {},
    });

    const className = classNames.join(' ');

    if (process.env.NODE_ENV !== 'production' && Element.isCsstaStyledComponent) {
      throw new Error('You cannot compose styled components yet');
    }

    return React.createElement(
      Element,
      Object.assign({}, passedProps, { className })
    );
  };

  if (process.env.NODE_ENV !== 'production') {
    Component.isCsstaStyledComponent = true;

    if (ownProps.indexOf('component') !== -1) {
      throw new Error('Cannot use attribute "component" for components');
    }

    Component.propTypes = ownProps.reduce((out, key) => {
      const styleMap = ownProps[key];

      if (typeof styleMap === 'string') {
        out[key] = PropTypes.bool;
      } else if (styleMap && typeof styleMap === 'object') {
        const allowedValues = Object.keys(styleMap);
        out[key] = PropTypes.oneOf(allowedValues);
      }
      /* eslint-enable */

      return out;
    }, {
      component: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.function,
      ]),
    });

    Component.defaultProps = {
      component,
    };
  }

  return Component;
};

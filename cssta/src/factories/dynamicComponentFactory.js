/* eslint-disable no-param-reassign */
const React = require('react');
const VariablesProvider = require('../variablesProvider');
const { getOwnPropKeys, getComponentProps, getPropTypes } = require('../util');


module.exports = (
  getExportedVariables,
  generateStylesheet,
  transformProps
) => (
  component,
  propTypes,
  importedVariables,
  ...otherParams
) => {
  const ownPropKeys = getOwnPropKeys(propTypes);
  const styleCache = {};

  const DynamicComponent = (props) => {
    const { Element, ownProps, passedProps } =
      getComponentProps(ownPropKeys, component, props);

    return React.createElement(
      VariablesProvider,
      {
        exportedVariables: variablesFromScope => (
          getExportedVariables(ownProps, variablesFromScope, ...otherParams)
        ),
      },
      (appliedVariables) => {
        const ownAppliedVariables = importedVariables.reduce((accum, key) => {
          accum[key] = appliedVariables[key];
          return accum;
        }, {});
        const styleCacheKey = JSON.stringify(ownAppliedVariables);
        const styleCached = styleCacheKey in styleCache;

        const stylesheet = styleCached
          ? styleCache[styleCacheKey]
          : generateStylesheet(ownAppliedVariables, ...otherParams);

        if (!styleCached) styleCache[styleCacheKey] = stylesheet;

        return React.createElement(Element, transformProps(ownProps, passedProps, stylesheet));
      }
    );
  };

  if (process.env.NODE_ENV !== 'production' && !Array.isArray(propTypes)) {
    DynamicComponent.propTypes = getPropTypes(ownPropKeys, propTypes);
  }

  return DynamicComponent;
};

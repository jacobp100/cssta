/* eslint-disable no-param-reassign */
const React = require('react');
const VariablesProvider = require('../variablesProvider');
const { shallowEqual, getOwnPropKeys, getComponentProps, getPropTypes } = require('../util');

const { Component } = React;

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

  const getStyles = (props, variablesFromScope) => {
    const { Element, ownProps, passedProps } = getComponentProps(ownPropKeys, component, props);
    const exportedVariables =
      getExportedVariables(ownProps, variablesFromScope, ...otherParams);
    return { Element, ownProps, passedProps, variablesFromScope, exportedVariables };
  };

  class DynamicComponent extends Component {
    constructor(props) {
      super();
      this.state = getStyles(props, {});

      this.child = (appliedVariables) => {
        const { Element, ownProps, passedProps } = this.state;
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
      };

      this.onParentVaribalesChanged = (variablesFromScope) => {
        this.setState(getStyles(this.props, variablesFromScope));
      };
    }

    componentWillUpdate(nextProps, nextState) {
      if (!shallowEqual(this.props, nextProps)) {
        this.setState(getStyles(nextProps, nextState.variablesFromScope));
      }
    }

    render() {
      const { exportedVariables } = this.state;
      return React.createElement(
        VariablesProvider,
        {
          onParentVaribalesChanged: this.onParentVaribalesChanged,
          onSetInitialParentVaribales: this.onParentVaribalesChanged,
          exportedVariables,
        },
        this.child
      );
    }
  }

  if (process.env.NODE_ENV !== 'production' && !Array.isArray(propTypes)) {
    DynamicComponent.propTypes = getPropTypes(ownPropKeys, propTypes);
  }

  return DynamicComponent;
};

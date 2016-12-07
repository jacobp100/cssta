/* eslint-disable no-param-reassign */
const React = require('react');
const EventEmitter = require('event-emitter');
const { getOwnPropKeys, getComponentProps, getPropTypes } = require('../util');

const { Component, PropTypes } = React;

const STYLES_UPDATED = 'styles-updated';

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

  const getStyles = (state, props, context) => {
    const { Element, ownProps, passedProps } = getComponentProps(ownPropKeys, component, props);

    const variablesFromScope = state.variablesFromScope || context.csstaInitialVariables || {};
    const exportedVariables = getExportedVariables(ownProps, variablesFromScope, ...otherParams);
    const appliedVariables = Object.assign({}, variablesFromScope, exportedVariables);

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

    return { Element, stylesheet, ownProps, passedProps, exportedVariables, appliedVariables };
  };

  class DynamicComponent extends Component {
    constructor(props, context) {
      super();
      this.state = getStyles({}, props, context);

      this.styleEmitter = new EventEmitter();
      this.styleUpdateHandler = (variablesFromScope) => {
        this.setState({ variablesFromScope });
      };
    }

    getChildContext() {
      return { cssta: this.styleEmitter, csstaInitialVariables: this.state.appliedVariables };
    }

    componentWillMount() {
      if (this.context.cssta) this.context.cssta.on(STYLES_UPDATED, this.styleUpdateHandler);
    }

    componentWillUpdate(nextProps, nextState, nextContext) {
      if (this.context.cssta !== nextContext.cssta) {
        if (this.context.cssta) this.context.cssta.off(STYLES_UPDATED, this.styleUpdateHandler);
        if (nextState.cssta) nextState.cssta.on(STYLES_UPDATED, this.styleUpdateHandler);
      }

      // FIXME: Shallow equal
      if (this.props !== nextProps) {
        this.setState(getStyles(nextState, nextProps, nextContext));
      }

      if (this.state.appliedVariables !== nextState.appliedVariables) {
        this.styleEmitter.emit(STYLES_UPDATED, nextState.appliedVariables);
      }
    }

    componentWillUnmount() {
      if (this.context.cssta) this.context.cssta.off(STYLES_UPDATED, this.styleUpdateHandler);
    }

    render() {
      const { Element, stylesheet, ownProps, passedProps } = this.state;
      return React.createElement(Element, transformProps(ownProps, passedProps, stylesheet));
    }
  }

  DynamicComponent.contextTypes = {
    cssta: PropTypes.object,
    csstaInitialVariables: PropTypes.object,
  };

  DynamicComponent.childContextTypes = DynamicComponent.contextTypes;

  if (process.env.NODE_ENV !== 'production' && !Array.isArray(propTypes)) {
    DynamicComponent.propTypes = getPropTypes(ownPropKeys, propTypes);
  }

  return DynamicComponent;
};

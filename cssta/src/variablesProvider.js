/* eslint-disable no-param-reassign */
const React = require('react');
const { EventEmitter } = require('events');
const { shallowEqual } = require('./util');

const { Component, Children, PropTypes } = React;

const STYLES_UPDATED = 'styles-updated';

const getStyles = (state, props, context) => {
  const variablesFromScope = state.variablesFromScope || context.csstaInitialVariables || {};
  const exportedVariables = props.exportedVariables || {}; // FIXME: Can be func
  const appliedVariables = Object.assign({}, variablesFromScope, exportedVariables);

  return { variablesFromScope, exportedVariables, appliedVariables };
};

class VariablesProvider extends Component {
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

  componentDidMount() {
    if (this.context.cssta) this.context.cssta.on(STYLES_UPDATED, this.styleUpdateHandler);
  }

  componentWillUpdate(nextProps, nextState, nextContext) {
    if (this.context.cssta !== nextContext.cssta) {
      if (this.context.cssta) this.context.cssta.off(STYLES_UPDATED, this.styleUpdateHandler);
      if (nextContext.cssta) nextContext.cssta.on(STYLES_UPDATED, this.styleUpdateHandler);
    }

    const variablesFromScopeChanged =
      !shallowEqual(this.state.variablesFromScope, nextState.variablesFromScope);
    let nextExportedVariables = variablesFromScopeChanged
      ? nextProps.exportedVariables
      : null;
    if (typeof nextExportedVariables === 'function') { // FIXME: Don't resolve here, do in getStyles
      nextExportedVariables = nextExportedVariables(this.state.variablesFromScope);
    }

    if (variablesFromScopeChanged ||
      !shallowEqual(this.state.exportedVariables, nextExportedVariables)) {
      this.setState(getStyles(nextState, nextProps, nextContext));
    }

    if (!shallowEqual(this.state.appliedVariables, nextState.appliedVariables)) {
      this.styleEmitter.emit(STYLES_UPDATED, nextState.appliedVariables);
    }
  }

  componentWillUnmount() {
    if (this.context.cssta) this.context.cssta.off(STYLES_UPDATED, this.styleUpdateHandler);
  }

  render() {
    const { children } = this.props;
    const { appliedVariables } = this.state;
    return (typeof children === 'function')
      ? children(appliedVariables)
      : Children.only(children);
  }
}

VariablesProvider.contextTypes = {
  cssta: PropTypes.object,
  csstaInitialVariables: PropTypes.object,
};

VariablesProvider.childContextTypes = VariablesProvider.contextTypes;

module.exports = VariablesProvider;

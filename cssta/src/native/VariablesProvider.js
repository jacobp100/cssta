/* eslint-disable no-param-reassign */
const React = require('react');
const { EventEmitter } = require('events');
const { shallowEqual } = require('../util');

const { Component, Children, PropTypes } = React;

const STYLES_UPDATED = 'styles-updated';

const getStyles = (variablesFromScope = {}, exportedVariables = {}) => {
  const appliedVariables = Object.assign(
    {},
    variablesFromScope,
    typeof exportedVariables === 'function'
      ? exportedVariables(variablesFromScope)
      : exportedVariables
  );

  return { variablesFromScope, appliedVariables };
};

class VariablesProvider extends Component {
  constructor(props, context) {
    super();
    this.state = getStyles(context.csstaInitialVariables || {}, props.exportedVariables);

    this.styleEmitter = new EventEmitter();
    this.styleUpdateHandler = (variablesFromScope) => {
      this.updateState(variablesFromScope, this.props.exportedVariables);
    };

    this.updateState = (variablesFromScope, exportedVariables) => {
      const nextState = getStyles(variablesFromScope, exportedVariables);

      if (!shallowEqual(this.state.variablesFromScope, nextState.variablesFromScope) ||
        !shallowEqual(this.state.appliedVariables, nextState.appliedVariables)) {
        this.setState(nextState);
      }
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
    const nextExportedVariablesChanged = typeof nextProps.exportedVariables === 'function'
      ? true
      : !shallowEqual(this.props.exportedVariables, nextProps.exportedVariables);

    if (variablesFromScopeChanged || nextExportedVariablesChanged) {
      this.updateState(nextState.variablesFromScope, nextProps.exportedVariables);
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

VariablesProvider.propTypes = {
  exportedVariables: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.element]),
};

module.exports = VariablesProvider;

/* eslint-disable no-param-reassign */
const React = require('react');
const { EventEmitter } = require('events');
const { shallowEqual } = require('./util');

const { Component, Children, PropTypes } = React;

const STYLES_UPDATED = 'styles-updated';

const getStyles = (state, props, context) => {
  const variablesFromScope = state.variablesFromScope || context.csstaInitialVariables || {};
  const exportedVariables = props.exportedVariables || {};
  const appliedVariables = Object.assign({}, variablesFromScope, exportedVariables);

  return { variablesFromScope, appliedVariables };
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

    if (this.props.onSetInitialParentVaribales) {
      this.props.onSetInitialParentVaribales(this.state.variablesFromScope);
    }
  }

  componentWillUpdate(nextProps, nextState, nextContext) {
    if (this.context.cssta !== nextContext.cssta) {
      if (this.context.cssta) this.context.cssta.off(STYLES_UPDATED, this.styleUpdateHandler);
      if (nextContext.cssta) nextContext.cssta.on(STYLES_UPDATED, this.styleUpdateHandler);
    }

    const exportedVariablesChanged =
      !shallowEqual(this.props.exportedVariables, nextProps.exportedVariables);
    const variablesFromScopeChanged =
      !shallowEqual(this.state.variablesFromScope, nextState.variablesFromScope);
    const appliedVariablesChanged =
      !shallowEqual(this.state.appliedVariables, nextState.appliedVariables);

    if (variablesFromScopeChanged && this.props.onParentVaribalesChanged) {
      this.props.onParentVaribalesChanged(nextState.variablesFromScope);
    }

    if (exportedVariablesChanged || variablesFromScopeChanged) {
      this.setState(getStyles(nextState, nextProps, nextContext));
    }

    if (appliedVariablesChanged) {
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

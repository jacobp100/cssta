// @flow
/*
CAUTION!

This file could be included even after running the babel plugin.

Make sure you don't import large libraries.
*/
/* eslint-disable no-param-reassign */
const React = require("react");
const PropTypes = require("prop-types");
const { EventEmitter } = require("events");
const { shallowEqual } = require("../util");
/*:: import type { VariablesStore } from './types' */

const { Component, Children } = React;

const STYLES_UPDATED = "styles-updated";

/*::
type InputVariables = VariablesStore | (variables: VariablesStore) => VariablesStore

type VariablesProviderState = {
  variablesFromScope: VariablesStore,
  appliedVariables: VariablesStore,
}

type VariablesProviderProps = {
  exportedVariables: InputVariables,
  children: any,
}
*/

const getStyles = (
  variablesFromScope /* VariablesStore */ = {},
  inputExportedVariables /*: InputVariables */ = {}
) /*: VariablesProviderState */ => {
  const exportedVariables =
    typeof inputExportedVariables === "function"
      ? inputExportedVariables(variablesFromScope)
      : inputExportedVariables;

  const appliedVariables = Object.assign(
    {},
    variablesFromScope,
    exportedVariables
  );

  return { variablesFromScope, appliedVariables };
};

class VariablesProvider extends Component /*:: <VariablesProviderProps, VariablesProviderState> */ {
  /*::
  styleUpdateHandler: any
  styleEmitter: any
  updateState: (variablesFromScope: VariablesStore, inputVariables: InputVariables) => void
  */

  constructor(props /*: VariablesProviderProps */, context /*: any */) {
    super();
    this.state = getStyles(
      context.csstaInitialVariables || {},
      props.exportedVariables
    );

    this.styleEmitter = new EventEmitter();
    this.styleUpdateHandler = variablesFromScope => {
      this.updateState(variablesFromScope, this.props.exportedVariables);
    };

    this.updateState = this.updateState.bind(this);
  }

  getChildContext() {
    return {
      cssta: this.styleEmitter,
      csstaInitialVariables: this.state.appliedVariables
    };
  }

  componentDidMount() {
    if (this.context.cssta) {
      this.context.cssta.on(STYLES_UPDATED, this.styleUpdateHandler);
    }
  }

  componentWillReceiveProps(nextProps /*: VariablesProviderProps */) {
    const nextExportedVariablesChanged =
      typeof nextProps.exportedVariables === "object"
        ? !shallowEqual(
            this.props.exportedVariables,
            nextProps.exportedVariables
          )
        : true; // If it's a function, it might change

    if (nextExportedVariablesChanged) {
      this.updateState(
        this.state.variablesFromScope,
        nextProps.exportedVariables
      );
    }
  }

  componentWillUnmount() {
    if (this.context.cssta) {
      this.context.cssta.off(STYLES_UPDATED, this.styleUpdateHandler);
    }
  }

  updateState(
    variablesFromScope /*: VariablesStore */,
    exportedVariables /*: InputVariables */
  ) {
    const nextState = getStyles(variablesFromScope, exportedVariables);

    if (
      !shallowEqual(
        this.state.variablesFromScope,
        nextState.variablesFromScope
      ) ||
      !shallowEqual(this.state.appliedVariables, nextState.appliedVariables)
    ) {
      this.setState(nextState);
      this.styleEmitter.emit(STYLES_UPDATED, nextState.appliedVariables);
    }
  }

  render() {
    const { children } = this.props;
    const { appliedVariables } = this.state;
    return typeof children === "function"
      ? children(appliedVariables)
      : Children.only(children);
  }
}

VariablesProvider.contextTypes = {
  cssta: PropTypes.object,
  csstaInitialVariables: PropTypes.object
};

VariablesProvider.childContextTypes = VariablesProvider.contextTypes;

VariablesProvider.propTypes = {
  exportedVariables: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.element])
};

module.exports = VariablesProvider;

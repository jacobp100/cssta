// @flow
/*
CAUTION!

This file could be included even after running the babel plugin.

Make sure you don't import large libraries.
*/
/* eslint-disable no-param-reassign */
const React = require("react");
const PropTypes = require("prop-types");
/*:: import type { VariablesStore } from './types' */

const { Component, Children } = React;

/*::
type InputVariables = VariablesStore | (variables: VariablesStore) => VariablesStore

type VariablesProviderProps = {
  exportedVariables: InputVariables,
  children: any,
}
*/

const VariablesContext = React.createContext(null);

class VariablesProvider extends Component /*:: <VariablesProviderProps> */ {
  constructor() {
    super();
    this.renderChildren = this.renderChildren.bind(this);
  }

  renderChildren(variablesFromScope) {
    const { exportedVariables: inputExportedVariables, children } = this.props;
    const exportedVariables =
      typeof inputExportedVariables === "function"
        ? inputExportedVariables(
            variablesFromScope != null ? variablesFromScope : {}
          )
        : inputExportedVariables;

    const appliedVariables = Object.assign(
      {},
      variablesFromScope,
      exportedVariables
    );

    return React.createElement(
      VariablesContext.Provider,
      { value: appliedVariables },
      typeof children === "function"
        ? children(appliedVariables)
        : Children.only(children)
    );
  }

  render() {
    return React.createElement(
      VariablesContext.Consumer,
      null,
      this.renderChildren
    );
  }
}

VariablesProvider.Consumer = VariablesContext.Consumer;

VariablesProvider.propTypes = {
  exportedVariables: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.element])
};

module.exports = VariablesProvider;

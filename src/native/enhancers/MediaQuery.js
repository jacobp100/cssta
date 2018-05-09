// @flow
/*
CAUTION!

This file could be included even after running the babel plugin.

Make sure you don't import large libraries.
*/
const React = require("react");
/* eslint-disable */
// $FlowFixMe
const { Dimensions, Platform } = require("react-native");
/* eslint-enable */
/*:: import type { DynamicProps } from '../../factories/types' */
/*::
import type { VariableArgs, Args, } from '../types'
*/

const { Component } = React;

const platform = Platform.OS;

module.exports = class MediaQueryEnhancer extends Component /*::<
  DynamicProps<Args | VariableArgs>,
  { width: number, height: number }
>*/ {
  /*:: listener: (dimensions: { window: { width: number, height: number } }) => void */

  constructor() {
    super();
    const initialWindow = Dimensions.get("window");
    this.state = { width: initialWindow.width, height: initialWindow.height };

    this.listener = ({ window: { width, height } }) => {
      this.setState(
        state =>
          state.width !== width || state.height !== height
            ? { width, height }
            : null
      );
    };
  }

  componentDidMount() {
    Dimensions.addEventListener("change", this.listener);
  }

  componentWillUnmount() {
    Dimensions.removeEventListener("change", this.listener);
  }

  render() {
    const { ownProps, children } = this.props;
    const { width, height } = this.state;
    return children({
      ...this.props,
      ownProps: {
        $ScreenWidth: width,
        $ScreenHeight: height,
        $Platform: platform,
        ...ownProps
      }
    });
  }
};

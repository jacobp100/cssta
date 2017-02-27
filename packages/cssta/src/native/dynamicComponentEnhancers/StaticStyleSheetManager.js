/* eslint-disable no-param-reassign */
const React = require('react');
const { createRuleStylesUsingStylesheet } = require('./util');

const { Component } = React;

module.exports = class StaticStyleSheetManager extends Component {
  constructor(props) {
    super();
    this.rules = createRuleStylesUsingStylesheet({}, props.args.rules);
  }

  render() {
    const { children } = this.props;
    const nextProps = this.props;
    nextProps.args.rules = this.rules;

    return React.cloneElement(children, nextProps);
  }
};

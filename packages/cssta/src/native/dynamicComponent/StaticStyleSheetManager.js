/* eslint-disable no-param-reassign */
const React = require('react');
const { createRuleStylesUsingStylesheet } = require('./util');

const { Component } = React;

module.exports = class StaticStyleSheetManager extends Component {
  constructor(props) {
    super();
    this.rules = createRuleStylesUsingStylesheet({}, props.rules);
  }

  render() {
    const { NextElement, Element, ownProps, passedProps, managerArgs } = this.props;
    const { rules } = this;

    const nextProps = { Element, ownProps, passedProps, rules, managerArgs };
    return React.createElement(NextElement, nextProps);
  }
};

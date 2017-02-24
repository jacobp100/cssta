/* eslint-disable no-param-reassign */
const React = require('react');
const { generateStylesheet } = require('./util');

const { Component } = React;

module.exports = class StaticStyleSheetManager extends Component {
  constructor(props) {
    super();
    this.stylesheet = generateStylesheet({}, props.rules);
  }

  render() {
    const { Element, ownProps, passedProps, managerArgs } = this.props;
    const { stylesheet } = this;

    const nextProps = { Element, ownProps, passedProps, stylesheet, managerArgs };
    return React.createElement(Element, nextProps);
  }
};

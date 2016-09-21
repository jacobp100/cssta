import React, { Component } from 'react';
import Button from './Button';


class App extends Component {
  render() {
    return React.createElement(
      'div',
      null,
      React.createElement(
        Button,
        null,
        'Test'
      ),
      React.createElement(
        Button,
        { color: 'red' },
        'Test'
      ),
      React.createElement(
        Button,
        { color: 'blue' },
        'Test'
      )
    );
  }
}

export default App;
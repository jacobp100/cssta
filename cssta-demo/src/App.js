import React, { Component } from 'react';
import Button from './Button';
import cssta from 'cssta';

cssta(`
  body {
    margin: 5em;
  }
`);

class App extends Component {
  render() {
    return (
      <div>
        <Button>Test</Button>
        <Button color="red">Test</Button>
        <Button color="blue">Test</Button>
      </div>
    );
  }
}

export default App;

import React from 'react';
import cssta from 'cssta';

const Button = cssta.button`
  background: white;
  color: black;
  border: 0;
  padding: 1rem 2rem;
  border-radius: 1000px;
  font-size: 1rem;

  :hover {
    background: lightgray;
  }

  [color="red"] {
    background: red;
    color: white;
  }

  [color="red"]:hover {
    background: maroon;
  }

  [color="blue"] {
    background: blue;
    color: white;
  }

  [color="blue"]:hover {
    background: darkblue;
  }

  [throb] {
    animation: 1s throb infinite;
  }

  @keyframes throb {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`;

const App = () => (
  <div>
    <Button>Test</Button>
    <Button color="red">Test</Button>
    <Button color="blue">Test</Button>
    <Button throb>Test</Button>
  </div>
);

export default App;

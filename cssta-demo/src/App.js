import 'dev-bootstrap';
import React from 'react';
import cssta from 'cssta';

cssta.injectGlobal(`
  body {
    margin: 10em;
  }

  @define-placeholder reset-button {
    background: none;
    border: none;
    border: 0;
    font-size: 1rem;
  }
`);

const Button = cssta.button`
  background: white;
  color: black;
  padding: 1rem 2rem;
  border-radius: 1000px;

  & {
    /* This has to be wrapped in a & selector, else it'll think that @extend is an at-rule */
    @extend reset-button;
  }

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }

  @supports (background: linear-gradient(to bottom, red, green)) {
    [christmas] {
      background: linear-gradient(to bottom, red, green);
    }
  }

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
    <Button christmas>Test</Button>
  </div>
);

export default App;

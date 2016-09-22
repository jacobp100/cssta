import React from 'react';
import cssta from 'cssta';

const styles = cssta(`
  .button {
    background: white;
    color: black;
    border: 0;
    padding: 1rem 2rem;
    border-radius: 1000px;
    font-size: 1rem;
  }

  .button:hover {
    background: lightgray;
  }

  .red {
    background: red;
    color: white;
  }

  .red:hover {
    background: maroon;
  }

  .blue {
    background: blue;
    color: white;
  }

  .blue:hover {
    background: darkblue;
  }

  .throb {
    animation: throb;
  }

  @keyframes throb {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`, 'Button');


export default ({ children, color }) => (
  <button className={`${styles.button} ${styles[color]}`}>
    {children}
  </button>
);

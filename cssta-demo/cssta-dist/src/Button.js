import React from 'react';


const styles = {
  "button": "A",
  "red": "B",
  "blue": "C"
};

export default (({ children, color }) => React.createElement(
  'button',
  { className: [styles.button, styles[color]].join(' ') },
  children
));
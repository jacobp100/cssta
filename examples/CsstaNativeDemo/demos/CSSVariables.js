import React, { Component } from 'react';
import { View, Button, Animated } from 'react-native';
import cssta from 'cssta/native';

const PickerRow = cssta(View)`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 20px;
`;

const DynamicContainer = cssta(View)`
  --color: black;

  [@color="red"] { --color: #e74c3c; }
  [@color="green"] { --color: #2ecc71; }
  [@color="blue"] { --color: #3498db; }
`;

class DynamicPicker extends Component {
  constructor() {
    super();
    this.state = { color: 'red' };
    this.setColor = color => this.setState({ color });
  }

  render() {
    const { color } = this.state;
    const { children } = this.props;

    return (
      <DynamicContainer color={color}>
        {children}
        <PickerRow>
          <Button title="Default" color="black" onPress={() => { this.setColor(null); }} />
          <Button title="Red" color="black" onPress={() => { this.setColor('red'); }} />
          <Button title="Green" color="black" onPress={() => { this.setColor('green'); }} />
          <Button title="Blue" color="black" onPress={() => { this.setColor('blue'); }} />
        </PickerRow>
      </DynamicContainer>
    );
  }
}

const DynamicText = cssta(Animated.Text)`
  color: var(--color);
  font-size: 20px;

  /* You can animate CSS variables */
  transition: color 0.1s;
`;

export default () => (
  <DynamicPicker>
    <DynamicText>Text dynamically styled with CSS variables!</DynamicText>
  </DynamicPicker>
);

export const code =
`--primary-color: red;
          color: var(--primary-color);`;

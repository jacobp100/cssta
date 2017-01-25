import React, { Component } from 'react';
import { View, Text, Button } from 'react-native';
import cssta from 'cssta/native';

const PickerRow = cssta(View)`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 20px;
`;

const DynamicContainer = cssta(View)`
  --color: black;

  [color="red"] { --color: red; }
  [color="green"] { --color: green; }
  [color="blue"] { --color: blue; }
`;

class DynamicPicker extends Component {
  constructor() {
    super();
    this.state = { color: 'red' };
    this.setColor = (color) => this.setState({ color });
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

const DynamicText = cssta(Text)`
  color: var(--color);
  font-size: 20px;
`;

export default () => (
  <DynamicPicker>
    <DynamicText>Text dynamically styled with CSS variables!</DynamicText>
  </DynamicPicker>
);

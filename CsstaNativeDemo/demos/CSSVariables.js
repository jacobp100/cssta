import React, { Component } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import cssta from 'cssta/native';

const PickerRow = cssta(View)`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 20;
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
    this.state = { color: null };
    this.setColor = (color) => this.setState({ color });
  }

  render() {
    const { color } = this.state;
    const { children } = this.props;
    return (
      <DynamicContainer color={color}>
        {children}
        <PickerRow>
          <TouchableOpacity onPress={() => { this.setColor(null); }}>
            <Text>Default</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { this.setColor('red'); }}>
            <Text>Red</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { this.setColor('green'); }}>
            <Text>Green</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { this.setColor('blue'); }}>
            <Text>Blue</Text>
          </TouchableOpacity>
        </PickerRow>
      </DynamicContainer>
    );
  }
}

const DynamicText = cssta(Text)`
  color: var(--color);
`;

export default () => (
  <DynamicPicker>
    <DynamicText>Text dynamically styled with CSS variables!</DynamicText>
  </DynamicPicker>
);

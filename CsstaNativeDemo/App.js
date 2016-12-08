import React, { Component } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import cssta from 'cssta/native';

const HeadingContainer = cssta(View)`
  margin: 50 50 20;
  padding: 10;
  border-radius: 5;
  border: 1 solid red;
`;

const HeadingText = cssta(Text)`
  color: red;
`;

const PickerRow = cssta(View)`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 20;
`;

const DynamicContainer = cssta(View)`
  padding: 20 50;
  --color: black;

  [color="red"] { --color: red; }
  [color="green"] { --color: green; }
  [color="blue"] { --color: blue; }
`;

const DynamicText = cssta(Text)`
  color: var(--color);
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

export default () => (
  <View>
    <HeadingContainer>
      <HeadingText>Hello World!</HeadingText>
    </HeadingContainer>
    <DynamicPicker>
      <DynamicText>Text dynamically styled with CSS variables!</DynamicText>
    </DynamicPicker>
  </View>
);

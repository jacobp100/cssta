import React, { Component } from 'react';
import { View, Text, Button, Slider } from 'react-native';
import cssta, { VariablesProvider } from 'cssta/native';

const Palette = cssta(View)`
  background-color: red;
  height: 20px;
  margin-bottom: 20px;
  transition: background-color 1s linear;

  [active] {
    background-color: blue;
  }
`;

export default class VariablesProviderDemo extends Component {
  constructor() {
    super();

    this.state = { active: false };
    this.toggleActive = ({ active }) => this.setState({ active: !active });
  }

  render() {
    const { active } = this.state;

    return (
      <View>
        <Palette active={active} />
        <Button title="Toggle colour" color="black" onPress={this.toggleActive} />
      </View>
    )
  }
}

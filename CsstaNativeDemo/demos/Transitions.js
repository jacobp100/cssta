import React, { Component } from 'react';
import { Animated, View, Button } from 'react-native';
import cssta from 'cssta/native';

const Palette = cssta(Animated.View)`
  background-color: #e74c3c;
  height: 20px;
  margin-bottom: 20px;
  transition: background-color 0.5s linear;

  [active] {
    background-color: #1abc9c;
  }
`;

export default class VariablesProviderDemo extends Component {
  constructor() {
    super();

    this.state = { active: false };
    this.toggleActive = () => this.setState(({ active }) => ({ active: !active }));
  }

  render() {
    const { active } = this.state;

    return (
      <View>
        <Palette active={active} />
        <Button title="Toggle Color" color="black" onPress={this.toggleActive} />
      </View>
    );
  }
}

export const code = 'transition: background-color 0.5s linear;';

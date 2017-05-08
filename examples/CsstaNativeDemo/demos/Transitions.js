import React, { Component } from 'react';
import { Animated, View, Button } from 'react-native';
import cssta from 'cssta/native';

const Palette = cssta(Animated.View)`
  background-color: #e74c3c;
  height: 20px;
  margin-bottom: 20px;
  transform: scaleX(1) rotate(0deg);
  transition: background-color 0.5s linear, transform 0.75s linear;

  &[@active] {
    background-color: #1abc9c;
    transform: scaleX(0.5) rotate(6deg);
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
        <Button title="Toggle Style" color="black" onPress={this.toggleActive} />
      </View>
    );
  }
}

export const code =
`transition:
    background-color 0.5s linear,
    transform 0.75s linear;`;

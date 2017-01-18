import React, { Component } from 'react';
import { View, Text, Slider } from 'react-native';
import cssta, { VariablesProvider } from 'cssta/native';

const Palette = cssta(View)`
  background: var(--active-color);
  height: 20;
  margin-bottom: 20;
`;

export default class VariablesProviderDemo extends Component {
  constructor() {
    super();

    this.state = { r: 255, g: 0, b: 0 };
    this.setColor = color => value => this.setState({ [color]: value });
  }

  render() {
    const { r, g, b } = this.state;
    const activeColor = `rgb(${r}, ${g}, ${b})`;

    return (
      <View>
        <VariablesProvider exportedVariables={{ 'active-color': activeColor }}>
          <Palette />
        </VariablesProvider>
        <Slider
          value={r}
          maximumValue={255}
          minimumTrackTintColor="red"
          onValueChange={this.setColor('r')}
        />
        <Slider
          value={g}
          maximumValue={255}
          minimumTrackTintColor="green"
          onValueChange={this.setColor('g')}
        />
        <Slider
          value={b}
          maximumValue={255}
          minimumTrackTintColor="blue"
          onValueChange={this.setColor('b')}
        />
      </View>
    )
  }
}

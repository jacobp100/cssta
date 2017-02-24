import React, { Component } from 'react';
import { View, Slider } from 'react-native';
import cssta from 'cssta/native';

const Palette = cssta(View)`
  height: 20px;
  margin-bottom: 20px;
`;

export default class VariablesProviderDemo extends Component {
  constructor() {
    super();

    this.state = { r: 243, g: 156, b: 18 };
    this.setColor = color => value => this.setState({ [color]: value });
  }

  render() {
    const { r, g, b } = this.state;
    const activeColor = `rgb(${r}, ${g}, ${b})`;

    return (
      <View>
        <Palette style={{ backgroundColor: activeColor }} />
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
    );
  }
}

export const code = "<Component style={{ backgroundColor: 'green' }} />";

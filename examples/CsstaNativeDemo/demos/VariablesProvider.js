import React, { Component } from "react";
import { View, Button } from "react-native";
import cssta, { VariablesProvider } from "cssta/native";

const Palette = cssta(View)`
  background: var(--active-color);
  height: 20px;
  margin-bottom: 20px;
`;

const getRandomColor = () => {
  const r = Math.round(Math.random() * 255);
  const g = Math.round(Math.random() * 255);
  const b = Math.round(Math.random() * 255);
  return `rgb(${r}, ${g}, ${b})`;
};

export default class VariablesProviderDemo extends Component {
  constructor() {
    super();

    this.state = { activeColor: getRandomColor() };
    this.setColor = () => this.setState({ activeColor: getRandomColor() });
  }

  render() {
    const { activeColor } = this.state;

    return (
      <View>
        <VariablesProvider exportedVariables={{ "active-color": activeColor }}>
          <Palette />
        </VariablesProvider>
        <Button
          title="Pick Random Color"
          color="black"
          onPress={this.setColor}
        />
      </View>
    );
  }
}

export const code = `/* React */
<VariablesProvider
    exportedVariables={{ color: activeColor }}>

/* CSS */
background-color: var(--color);`;

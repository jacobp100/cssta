import React, { Component } from 'react';
import { View, Text, Animated, Button } from 'react-native';
import cssta, { VariablesProvider } from 'cssta/native';

const Container = cssta(View)`
  align-items: center;
`;

const Box = cssta(Animated.View)`
  width: 50px;
  height: 50px;
  margin: 10px 0px;
  background-color: #f39c12;
`;

const Description = cssta(Text)`
  margin-top: 10px;
`;
export default class VariablesProviderDemo extends Component {
  constructor() {
    super();

    this.state = {
      rotation: new Animated.Value(0),
    };

    this.triggerAnimation = () => {
      Animated.spring(this.state.rotation, {
        toValue: 0,
        velocity: 20,
        tension: -3,
        friction: 2,
      }).start();
    }
  }

  render() {
    const { rotation } = this.state;

    const rotate = rotation.interpolate({
      inputRange: [-1, 1],
      outputRange: ['-30deg', '30deg'],
    });

    return (
      <Container>
        <Box style={{ transform: [{ rotate }] }} />
        <Button title="Trigger animation" color="black" onPress={this.triggerAnimation} />
      </Container>
    )
  }
}

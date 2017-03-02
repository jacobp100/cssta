import React, { Component } from 'react';
import { Animated, View, Button } from 'react-native';
import cssta from 'cssta/native';

const Center = cssta(View)`
  align-items: center;
`;

const Row = cssta(View)`
  flex-direction: row;
`;

const Palette = cssta(Animated.View)`
  background-color: #e74c3c;
  height: 50px;
  width: 50px;
  margin-bottom: 20px;

  [animation = "fade-in"] {
    animation: 0.5s fade-in;
  }

  [animation = "slide-in"] {
    animation: 0.5s slide-in;
  }

  [animation = "zoom-in"] {
    animation: 0.5s zoom-in;
  }

  @keyframes fade-in {
    start { opacity: 0; }
    end { opacity: 1; }
  }

  @keyframes slide-in {
    0% {
      opacity: 0;
      transform: translateX(-50px);
    }

    80% {
      transform: translateX(5px);
    }

    100% {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes zoom-in {
    0% {
      opacity: 0;
      transform: scale(0);
    }

    80% {
      transform: scale(1.25);
    }

    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

export default class VariablesProviderDemo extends Component {
  constructor() {
    super();
    this.state = { animation: 'fade-in' };
    this.setAnimation = animation => () => this.setState({ animation });
  }

  render() {
    const { animation } = this.state;

    return (
      <Center>
        <Palette animation={animation} />
        <Row>
          <Button title="Fade In" color="black" onPress={this.setAnimation('fade-in')} />
          <Button title="Slide In" color="black" onPress={this.setAnimation('slide-in')} />
          <Button title="Zoom In" color="black" onPress={this.setAnimation('zoom-in')} />
        </Row>
      </Center>
    );
  }
}

export const code = '@keyframes { ... }';

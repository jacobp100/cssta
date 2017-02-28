import React, { Component } from 'react';
import { TouchableWithoutFeedback, Animated } from 'react-native';
import cssta from 'cssta/native';


const ButtonContainer = cssta(Animated.View)`
  --primary: #e67e22;
  --foreground: var(--primary);
  --background: white;

  margin: 10px 50px;
  padding: 10px 15px;
  border-radius: 1000px;
  border: 1px solid var(--primary);
  background-color: var(--background);
  transition: background-color 0.2s;

  [active] {
    --foreground: white;
    --background: var(--primary);
  }
`;

const ButtonText = cssta(Animated.Text)`
  color: var(--foreground);
  text-align: center;
  transition: color 0.3s;
`;

class Button extends Component {
  constructor() {
    super();
    this.state = { active: false };
    this.onPressIn = () => this.setState({ active: true });
    this.onPressOut = () => this.setState({ active: false });
  }

  render() {
    const { active } = this.state;
    const { children } = this.props;

    return (
      <TouchableWithoutFeedback
        onPressIn={this.onPressIn}
        onPressOut={this.onPressOut}
      >
        <ButtonContainer active={active}>
          <ButtonText>{children}</ButtonText>
        </ButtonContainer>
      </TouchableWithoutFeedback>
    );
  }
}

export default () => <Button>Hello world!</Button>;

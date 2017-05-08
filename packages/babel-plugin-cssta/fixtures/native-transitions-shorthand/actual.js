import cssta from 'cssta/native';
import { Animated } from 'react-native';

cssta(Animated.View)`
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

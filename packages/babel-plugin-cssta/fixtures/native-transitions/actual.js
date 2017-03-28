import cssta from 'cssta/native';
import { Animated } from 'react-native';

cssta(Animated.View)`
  color: red;
  transition: color 1s linear;

  [*boolAttr] {
    color: blue;
  }
`;

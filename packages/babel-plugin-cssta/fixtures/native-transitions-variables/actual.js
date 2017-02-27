import cssta from 'cssta/native';
import { Animated } from 'react-native';

cssta(Animated.View)`
  color: var(--primary);
  transition: color 1s linear;

  [boolAttr] {
    color: var(--secondary);
  }
`;

import cssta from 'cssta/native';
import { Animated } from 'react-native';

cssta(Animated.View)`
  color: var(--primary);
  animation: test 1s linear;

  @keyframes test {
    start { color: rgba(0, 0, 0, 0); }
    end { rgba: rgba(0, 0, 0, 1); }
  }
`;

import cssta from 'cssta/native';
import { Animated } from 'react-native';

cssta(Animated.View)`
  color: red;
  animation: test 1s linear;

  @keyframes test {
    start { color: rgba(0, 0, 0, 0); }
    end { opacity: var(--primary); }
  }
`;

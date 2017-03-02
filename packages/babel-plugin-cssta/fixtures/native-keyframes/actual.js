import cssta from 'cssta/native';
import { Animated } from 'react-native';

cssta(Animated.View)`
  color: red;
  animation: test 1s linear;

  @keyframes test {
    start { opacity: 0; }
    50% { opacity: 0.2; }
    end { opacity: 1; }
  }
`;

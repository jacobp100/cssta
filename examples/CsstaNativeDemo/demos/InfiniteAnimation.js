import { Animated } from "react-native";
import cssta from "cssta/native";

export default cssta(Animated.View)`
  align-self: center;
  background-color: #e74c3c;
  height: 50px;
  width: 50px;
  animation: 3s spin linear infinite;

  @keyframes spin {
    start { transform: rotate(0deg); }
    end { transform: rotate(360deg); }
  }
`;

export const code = "animation: 3s spin linear infinite;";

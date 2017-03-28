import cssta from 'cssta/native';
import { View } from 'react-native';

const marginSmall = 10;
const marginLarge = 10;

cssta(View)`
  [@attr1] {
    padding-top: 10px;
    margin: ${marginLarge}px ${marginSmall}px;
  }

  [@attr2] {
    margin: ${marginLarge}px ${marginSmall}px;
    padding-top: 10px;
  }

  [@attr3] {
    padding-top: 10px;
    margin: ${marginLarge}px ${marginSmall}px;
    padding-bottom: 10px;
  }
`;

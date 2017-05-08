import cssta from 'cssta/native';
import { View } from 'react-native';

const font = '10px "Helvetica"';

cssta(View)`
  &[@attr1] {
    margin-top: 10px;
    font: ${font};
  }

  &[@attr2] {
    font: ${font};
    margin-top: 10px;
  }

  &[@attr3] {
    margin-top: 10px;
    font: ${font};
    margin-bottom: 10px;
  }
`;

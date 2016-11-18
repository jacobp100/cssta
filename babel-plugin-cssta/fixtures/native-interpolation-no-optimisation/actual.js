import cssta from 'cssta/native';
import { View } from 'react-native';

const color = 'red';

cssta(View)`
  [attr1] {
    margin-top: 10;
    color: ${color};
  }

  [attr2] {
    color: ${color};
    margin-top: 10;
  }

  [attr3] {
    margin-top: 10;
    color: ${color};
    margin-bottom: 10;
  }
`;

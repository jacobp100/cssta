import cssta from 'cssta/native';
import { View } from 'react-native';

const font = '10 "Helvetica"';

cssta(View)`
  [attr1] {
    margin-top: 10;
    font: ${font};
  }

  [attr2] {
    font: ${font};
    margin-top: 10;
  }

  [attr3] {
    margin-top: 10;
    font: ${font};
    margin-bottom: 10;
  }
`;

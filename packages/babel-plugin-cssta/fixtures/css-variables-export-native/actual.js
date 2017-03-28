import cssta from 'cssta/native';
import { View } from 'react-native';

cssta(View)`
  --color: red;

  [@blue] {
    --color: blue;
  }
`;

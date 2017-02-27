import cssta from 'cssta/native';
import { View } from 'react-native';

const color = 'blue';

cssta(View)`
  --color: red;
`;

cssta(View)`
  color: var(--color, ${color});
`;

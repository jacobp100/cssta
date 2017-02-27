import cssta from 'cssta/native';
import { View } from 'react-native';

cssta(View)`
  --large: 100;
  --small: 50;
  --margin: var(--large) var(--small);

  width: var(--large);
`;

cssta(View)`
  width: var(--small);
`;

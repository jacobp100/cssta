import cssta from 'cssta';
import { View } from 'react-native';

cssta.div`
  --color: red;
  color: var(--color);
`;

cssta.div`
  color: var(--color);
`;

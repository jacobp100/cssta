import cssta from 'cssta/native';
import { View } from 'react-native';

function test() {
  const Component = cssta(View)`
    color: red;
  `;
}

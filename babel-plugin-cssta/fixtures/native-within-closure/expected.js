import { StyleSheet as _StyleSheet } from 'react-native';
import _staticComponent from 'cssta/dist/native/staticComponent';

import { View } from 'react-native';

function test() {
  var _csstaStyle;

  const Component = (_csstaStyle = _StyleSheet.create({
    0: {
      'color': 'red'
    }
  }), _staticComponent(View, [], [{
    'validate': function (p) {
      return true;
    },
    'style': _csstaStyle[0]
  }]));
}
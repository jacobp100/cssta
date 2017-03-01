import _staticComponent from 'cssta/dist/native/staticComponent';
import { StyleSheet as _StyleSheet } from 'react-native';

import { View } from 'react-native';

function test() {
  var _csstaStyle = _StyleSheet.create({
    0: {
      'color': 'red'
    }
  });

  const Component = _staticComponent(View, [], [{
    'validate': function (p) {
      return true;
    },
    'transitions': {},
    'exportedVariables': {},
    'style': _csstaStyle[0]
  }]);
}
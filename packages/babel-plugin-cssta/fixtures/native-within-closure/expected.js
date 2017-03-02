import _staticComponent from 'cssta/lib/native/staticComponent';
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
    'animation': null,
    'style': _csstaStyle[0]
  }]);
}
import { StyleSheet as _StyleSheet } from 'react-native';
import _staticComponent from 'cssta/lib/native/staticComponent';

import { View } from 'react-native';

const color = 'blue';

_staticComponent(View, [], []);

var _csstaStyle2 = _StyleSheet.create({
  0: {
    'color': 'red'
  }
});

_staticComponent(View, [], [{
  'validate': function (p) {
    return true;
  },
  'transitions': {},
  'exportedVariables': {},
  'animation': null,
  'style': _csstaStyle2[0]
}]);
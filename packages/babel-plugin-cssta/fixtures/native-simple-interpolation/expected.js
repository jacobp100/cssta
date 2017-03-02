import _staticComponent from 'cssta/lib/native/staticComponent';
import { StyleSheet as _StyleSheet } from 'react-native';

import { View } from 'react-native';

const color = 'red';

var _csstaStyle = _StyleSheet.create({
  0: {
    'marginTop': 10,
    'color': String(color).trim()
  },
  1: {
    'color': String(color).trim(),
    'marginTop': 10
  },
  2: {
    'marginTop': 10,
    'color': String(color).trim(),
    'marginBottom': 10
  }
});

_staticComponent(View, ['attr1', 'attr2', 'attr3'], [{
  'validate': function (p) {
    return !!p['attr1'];
  },
  'transitions': {},
  'exportedVariables': {},
  'animation': null,
  'style': _csstaStyle[0]
}, {
  'validate': function (p) {
    return !!p['attr2'];
  },
  'transitions': {},
  'exportedVariables': {},
  'animation': null,
  'style': _csstaStyle[1]
}, {
  'validate': function (p) {
    return !!p['attr3'];
  },
  'transitions': {},
  'exportedVariables': {},
  'animation': null,
  'style': _csstaStyle[2]
}]);
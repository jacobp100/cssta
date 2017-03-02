import _staticComponent from 'cssta/lib/native/staticComponent';
import { StyleSheet as _StyleSheet } from 'react-native';

import { View } from 'react-native';

var _csstaStyle = _StyleSheet.create({
  0: {
    'width': 100
  }
});

_staticComponent(View, [], [{
  'validate': function (p) {
    return true;
  },
  'transitions': {},
  'exportedVariables': {
    'large': '100',
    'small': '50',
    'margin': '100 50'
  },
  'animation': null,
  'style': _csstaStyle[0]
}]);

var _csstaStyle2 = _StyleSheet.create({
  0: {
    'width': 50
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
import { StyleSheet as _StyleSheet } from 'react-native';
import _staticComponent from 'cssta/dist/native/staticComponent';

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
  'style': _csstaStyle2[0]
}]);
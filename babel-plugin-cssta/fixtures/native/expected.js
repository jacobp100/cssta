import { StyleSheet as _StyleSheet } from 'react-native';
import _csstaDistNativeStaticComponent from 'cssta/dist/native/staticComponent';

import { View } from 'react-native';

var _csstaStyle = _StyleSheet.create({
  0: {
    'color': 'red'
  }
});

_csstaDistNativeStaticComponent(View, [], [{
  'validate': function (p) {
    return true;
  },
  'style': _csstaStyle[0]
}]);
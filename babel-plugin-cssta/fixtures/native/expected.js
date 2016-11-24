import { StyleSheet as _StyleSheet } from 'react-native';
import _csstaDistNativeCreateComponent from 'cssta/dist/native/createComponent';

import { View } from 'react-native';

var _csstaStyle = _StyleSheet.create({
  'style1': {
    'color': 'red'
  }
});

_csstaDistNativeCreateComponent(View, [], [{
  'validator': function (p) {
    return true;
  },
  'style': _csstaStyle['style1']
}]);
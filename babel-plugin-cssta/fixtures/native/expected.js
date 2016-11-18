import { StyleSheet as _StyleSheet } from 'react-native';
import _csstaLibNativeCreateComponent from 'cssta/lib/native/createComponent';

import { View } from 'react-native';

var _csstaStyle = _StyleSheet.create({
  'style1': {
    'color': 'red'
  }
});

_csstaLibNativeCreateComponent(View, [], [{
  'validator': function (p) {
    return true;
  },
  'style': _csstaStyle['style1']
}]);
import { StyleSheet as _StyleSheet } from 'react-native';
import _csstaDistNativeCreateComponent from 'cssta/dist/native/createComponent';

import { View } from 'react-native';

var _csstaStyle = _StyleSheet.create({
  'style1': {
    'fontStyle': 'italic',
    'fontVariant': [],
    'fontWeight': 'bold',
    'fontSize': 12,
    'fontFamily': 'Helvetica',
    'lineHeight': 18
  }
});

_csstaDistNativeCreateComponent(View, [], [{
  'validate': function (p) {
    return true;
  },
  'style': _csstaStyle['style1']
}]);
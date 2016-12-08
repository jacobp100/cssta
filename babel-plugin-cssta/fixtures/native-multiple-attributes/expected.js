import { StyleSheet as _StyleSheet } from 'react-native';
import _csstaDistNativeStaticComponent from 'cssta/dist/native/staticComponent';

import { View } from 'react-native';

var _csstaStyle = _StyleSheet.create({
  0: {
    'color': 'red'
  },
  1: {
    'color': 'green'
  },
  2: {
    'color': 'blue'
  },
  3: {
    'color': 'yellow'
  }
});

_csstaDistNativeStaticComponent(View, ['booleanAttribute', 'stringAttribute'], [{
  'validate': function (p) {
    return true;
  },
  'style': _csstaStyle[0]
}, {
  'validate': function (p) {
    return !!p['booleanAttribute'];
  },
  'style': _csstaStyle[1]
}, {
  'validate': function (p) {
    return p['stringAttribute'] === '1';
  },
  'style': _csstaStyle[2]
}, {
  'validate': function (p) {
    return p['stringAttribute'] === '2';
  },
  'style': _csstaStyle[3]
}]);
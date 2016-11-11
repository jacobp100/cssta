import _csstaCreateComponent from 'cssta/lib/native/createComponent';

import { View } from 'react-native';

import { StyleSheet as _StyleSheet } from 'react-native';

var _csstaStyle = _StyleSheet.create({
  'style1': {
    'color': 'red'
  },
  'style2': {
    'color': 'green'
  },
  'style3': {
    'color': 'blue'
  },
  'style4': {
    'color': 'yellow'
  }
});

_csstaCreateComponent(View, ['booleanAttribute', 'stringAttribute'], [{
  'validator': function (p) {
    return true;
  },
  'style': _csstaStyle['style1']
}, {
  'validator': function (p) {
    return !!p['booleanAttribute'];
  },
  'style': _csstaStyle['style2']
}, {
  'validator': function (p) {
    return p['stringAttribute'] === '1';
  },
  'style': _csstaStyle['style3']
}, {
  'validator': function (p) {
    return p['stringAttribute'] === '2';
  },
  'style': _csstaStyle['style4']
}]);
import _createComponent from 'cssta/lib/native/createComponent';
import { StyleSheet as _StyleSheet } from 'react-native';

import { View } from 'react-native';

var _csstaStyle = _StyleSheet.create({
  0: {
    'fontStyle': 'italic',
    'fontWeight': 'bold',
    'fontVariant': [],
    'fontSize': 12,
    'fontFamily': 'Helvetica',
    'lineHeight': 18
  }
});

_createComponent(View, [], {
  'transitionedProperties': [],
  'keyframes': {},
  'rules': [{
    'validate': function (p) {
      return true;
    },
    'transitions': {},
    'animation': null,
    'style': _csstaStyle[0]
  }]
});
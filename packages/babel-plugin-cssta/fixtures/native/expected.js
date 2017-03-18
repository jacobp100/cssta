import _createComponent from 'cssta/lib/native/createComponent';
import { StyleSheet as _StyleSheet } from 'react-native';

import { View } from 'react-native';

var _csstaStyle = _StyleSheet.create({
  0: {
    'color': 'red'
  }
});

_createComponent(View, [], {
  'importedVariables': [],
  'transitionedProperties': [],
  'keyframes': {},
  'rules': [{
    'validate': function (p) {
      return true;
    },
    'exportedVariables': {},
    'style': _csstaStyle[0]
  }]
});
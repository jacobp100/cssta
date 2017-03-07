import _createComponent from 'cssta/lib/native/createComponent';
import { StyleSheet as _StyleSheet } from 'react-native';

import { View } from 'react-native';

var _csstaStyle = _StyleSheet.create({
  0: {
    'color': 'red'
  }
});

_createComponent(View, [], {
  'transitionedProperties': [],
  'importedVariables': [],
  'rules': [{
    'validate': function (p) {
      return true;
    },
    'transitions': {},
    'exportedVariables': {},
    'animation': null,
    'style': _csstaStyle[0]
  }],
  'keyframes': {}
});
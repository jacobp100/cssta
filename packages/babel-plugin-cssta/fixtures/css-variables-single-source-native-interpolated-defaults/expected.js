import { StyleSheet as _StyleSheet } from 'react-native';
import _createComponent from 'cssta/lib/native/createComponent';

import { View } from 'react-native';

const color = 'blue';

_createComponent(View, [], {
  'transitionedProperties': [],
  'importedVariables': [],
  'rules': [{
    'validate': function (p) {
      return true;
    },
    'transitions': {},
    'exportedVariables': {
      'color': 'red'
    },
    'animation': null,
    'style': null
  }],
  'keyframes': {}
});

var _csstaStyle2 = _StyleSheet.create({
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
    'style': _csstaStyle2[0]
  }],
  'keyframes': {}
});
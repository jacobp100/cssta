import _createComponent from 'cssta/lib/native/createComponent';
import { StyleSheet as _StyleSheet } from 'react-native';

import { View } from 'react-native';

var _csstaStyle = _StyleSheet.create({
  0: {
    'width': 100
  }
});

_createComponent(View, [], {
  'transitionedProperties': [],
  'rules': [{
    'validate': function (p) {
      return true;
    },
    'transitions': {},
    'animation': null,
    'style': _csstaStyle[0]
  }],
  'keyframes': {}
});

var _csstaStyle2 = _StyleSheet.create({
  0: {
    'width': 50
  }
});

_createComponent(View, [], {
  'transitionedProperties': [],
  'rules': [{
    'validate': function (p) {
      return true;
    },
    'transitions': {},
    'animation': null,
    'style': _csstaStyle2[0]
  }],
  'keyframes': {}
});
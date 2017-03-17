import _withEnhancers from 'cssta/lib/native/withEnhancers';
import _Transition from 'cssta/lib/native/enhancers/Transition';
import { StyleSheet as _StyleSheet } from 'react-native';

import { Animated } from 'react-native';

var _csstaStyle = _StyleSheet.create({
  0: {
    'color': 'red'
  },
  1: {
    'color': 'blue'
  }
});

_withEnhancers([_Transition])(Animated.View, ['boolAttr'], {
  'importedVariables': [],
  'transitionedProperties': ['color'],
  'keyframes': {},
  'rules': [{
    'validate': function (p) {
      return true;
    },
    'transitions': {
      'color': ['1s', 'linear']
    },
    'exportedVariables': {},
    'animation': null,
    'style': _csstaStyle[0]
  }, {
    'validate': function (p) {
      return !!p['boolAttr'];
    },
    'transitions': {},
    'exportedVariables': {},
    'animation': null,
    'style': _csstaStyle[1]
  }]
});
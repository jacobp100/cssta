import _dynamicComponent from 'cssta/dist/native/dynamicComponent';
import _Transition from 'cssta/dist/native/dynamicComponentEnhancers/Transition';
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

_dynamicComponent(Animated.View, ['boolAttr'], [_Transition], {
  'rules': [{
    'validate': function (p) {
      return true;
    },
    'transitions': {
      'color': ['1s', 'linear']
    },
    'exportedVariables': {},
    'style': _csstaStyle[0]
  }, {
    'validate': function (p) {
      return !!p['boolAttr'];
    },
    'transitions': {},
    'exportedVariables': {},
    'style': _csstaStyle[1]
  }],
  'transitions': ['color'],
  'importedVariables': []
});
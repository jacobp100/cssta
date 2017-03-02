import _dynamicComponent from 'cssta/lib/native/dynamicComponent';
import _Animation from 'cssta/lib/native/dynamicComponentEnhancers/Animation';
import { StyleSheet as _StyleSheet } from 'react-native';

import { Animated } from 'react-native';

var _csstaStyle = _StyleSheet.create({
  0: {
    'color': 'red'
  }
});

_dynamicComponent(Animated.View, [], [_Animation], {
  'transitionedProperties': [],
  'importedVariables': [],
  'rules': [{
    'validate': function (p) {
      return true;
    },
    'transitions': {},
    'exportedVariables': {},
    'animation': ['test', '1s', 'linear'],
    'style': _csstaStyle[0]
  }],
  'keyframes': {
    'test': [{
      'time': 0,
      'styles': {
        'opacity': 0
      }
    }, {
      'time': 0.5,
      'styles': {
        'opacity': 0.2
      }
    }, {
      'time': 1,
      'styles': {
        'opacity': 1
      }
    }]
  }
});
import _dynamicComponent from 'cssta/lib/native/dynamicComponent';
import _Transition from 'cssta/lib/native/dynamicComponentEnhancers/Transition';
import { StyleSheet as _StyleSheet } from 'react-native';

import { Animated } from 'react-native';

var _csstaStyle = _StyleSheet.create({
  0: {
    'backgroundColor': '#e74c3c',
    'height': 20,
    'marginBottom': 20,
    'transform': [{
      'rotate': '0deg'
    }, {
      'scaleX': 1
    }]
  },
  1: {
    'backgroundColor': '#1abc9c',
    'transform': [{
      'rotate': '6deg'
    }, {
      'scaleX': 0.5
    }]
  }
});

_dynamicComponent(Animated.View, ['active'], [_Transition], {
  'transitionedProperties': ['backgroundColor', 'transform'],
  'importedVariables': [],
  'rules': [{
    'validate': function (p) {
      return true;
    },
    'transitions': {
      'backgroundColor': ['0.5s', 'linear'],
      'transform': ['0.75s', 'linear']
    },
    'exportedVariables': {},
    'animation': null,
    'style': _csstaStyle[0]
  }, {
    'validate': function (p) {
      return !!p['active'];
    },
    'transitions': {},
    'exportedVariables': {},
    'animation': null,
    'style': _csstaStyle[1]
  }],
  'keyframes': {}
});
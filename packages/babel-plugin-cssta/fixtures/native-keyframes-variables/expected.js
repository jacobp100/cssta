import { StyleSheet as _StyleSheet } from 'react-native';
import _withEnhancers from 'cssta/lib/native/withEnhancers';
import _Animation from 'cssta/lib/native/enhancers/Animation';
import _VariablesStyleSheetManager from 'cssta/lib/native/enhancers/VariablesStyleSheetManager';

import { Animated } from 'react-native';

var _csstaStyle = _StyleSheet.create({
  0: {
    'color': 'red'
  }
});

_withEnhancers([_VariablesStyleSheetManager, _Animation])(Animated.View, [], {
  'transitionedProperties': [],
  'importedVariables': ['primary'],
  'keyframesStyleTuples': {
    'test': [{
      'time': 0,
      'styleTuples': [['color', 'rgba(0, 0, 0, 0)']]
    }, {
      'time': 1,
      'styleTuples': [['color', 'var(--primary)']]
    }]
  },
  'ruleTuples': [{
    'validate': function (p) {
      return true;
    },
    'transitions': {},
    'animation': ['test', '1s', 'linear'],
    'style': _csstaStyle[0]
  }]
});
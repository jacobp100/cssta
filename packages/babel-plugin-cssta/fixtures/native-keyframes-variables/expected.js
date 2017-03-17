import _withEnhancers from 'cssta/lib/native/withEnhancers';
import _Animation from 'cssta/lib/native/enhancers/Animation';
import _VariablesStyleSheetManager from 'cssta/lib/native/enhancers/VariablesStyleSheetManager';

import { Animated } from 'react-native';

_withEnhancers([_VariablesStyleSheetManager, _Animation])(Animated.View, [], {
  'importedVariables': ['primary'],
  'transitionedProperties': [],
  'keyframesStyleTuples': {
    'test': [{
      'time': 0,
      'styleTuples': [['color', 'rgba(0, 0, 0, 0)']]
    }, {
      'time': 1,
      'styleTuples': [['opacity', 'var(--primary)']]
    }]
  },
  'ruleTuples': [{
    'validate': function (p) {
      return true;
    },
    'transitions': {},
    'exportedVariables': {},
    'animation': ['test', '1s', 'linear'],
    'styleTuples': [['color', 'red']]
  }]
});
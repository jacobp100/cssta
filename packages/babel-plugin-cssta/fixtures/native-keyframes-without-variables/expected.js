import _withEnhancers from 'cssta/lib/native/withEnhancers';
import _Animation from 'cssta/lib/native/enhancers/Animation';
import _VariablesStyleSheetManager from 'cssta/lib/native/enhancers/VariablesStyleSheetManager';

import { Animated } from 'react-native';

_withEnhancers([_VariablesStyleSheetManager, _Animation])(Animated.View, [], {
  'transitionedProperties': [],
  'importedVariables': ['primary'],
  'keyframesStyleTuples': {
    'test': [{
      'time': 0,
      'styles': {
        'color': 'rgba(0, 0, 0, 0)'
      }
    }, {
      'time': 1,
      'styles': {
        'rgba': 'rgba(0, 0, 0, 1)'
      }
    }]
  },
  'ruleTuples': [{
    'validate': function (p) {
      return true;
    },
    'exportedVariables': {},
    'transitionParts': {},
    'animationParts': ['test', '1s', 'linear'],
    'styleTuples': [['color', 'var(--primary)']]
  }]
});
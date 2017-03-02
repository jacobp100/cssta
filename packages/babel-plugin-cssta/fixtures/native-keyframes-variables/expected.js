import _dynamicComponent from 'cssta/lib/native/dynamicComponent';
import _Animation from 'cssta/lib/native/dynamicComponentEnhancers/Animation';
import _VariablesStyleSheetManager from 'cssta/lib/native/dynamicComponentEnhancers/VariablesStyleSheetManager';

import { Animated } from 'react-native';

_dynamicComponent(Animated.View, [], [_VariablesStyleSheetManager, _Animation], {
  'transitionedProperties': [],
  'importedVariables': ['primary'],
  'rules': [{
    'validate': function (p) {
      return true;
    },
    'transitions': {},
    'exportedVariables': {},
    'animation': ['test', '1s', 'linear'],
    'styleTuples': [['color', 'red']]
  }],
  'keyframesStyleTuples': {
    'test': [{
      'time': 0,
      'styleTuples': [['color', 'rgba(0, 0, 0, 0)']]
    }, {
      'time': 1,
      'styleTuples': [['opacity', 'var(--primary)']]
    }]
  }
});
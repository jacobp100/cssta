import _withEnhancers from 'cssta/lib/native/withEnhancers';
import _Transition from 'cssta/lib/native/enhancers/Transition';
import _VariablesStyleSheetManager from 'cssta/lib/native/enhancers/VariablesStyleSheetManager';

import { Animated } from 'react-native';

_withEnhancers([_VariablesStyleSheetManager, _Transition])(Animated.View, ['boolAttr'], {
  'importedVariables': ['primary', 'secondary'],
  'transitionedProperties': ['color'],
  'keyframesStyleTuples': {},
  'ruleTuples': [{
    'validate': function (p) {
      return true;
    },
    'exportedVariables': {},
    'styleTuples': [['color', 'var(--primary)']]
  }, {
    'validate': function (p) {
      return !!p['boolAttr'];
    },
    'exportedVariables': {},
    'styleTuples': [['color', 'var(--secondary)']]
  }]
});
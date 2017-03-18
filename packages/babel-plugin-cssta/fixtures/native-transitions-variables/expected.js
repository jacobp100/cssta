import _withEnhancers from 'cssta/lib/native/withEnhancers';
import _Transition from 'cssta/lib/native/enhancers/Transition';
import _VariablesStyleSheetManager from 'cssta/lib/native/enhancers/VariablesStyleSheetManager';

import { Animated } from 'react-native';

_withEnhancers([_VariablesStyleSheetManager, _Transition])(Animated.View, ['boolAttr'], {
  'transitionedProperties': ['color'],
  'importedVariables': ['primary', 'secondary'],
  'keyframesStyleTuples': {},
  'ruleTuples': [{
    'validate': function (p) {
      return true;
    },
    'exportedVariables': {},
    'transitionParts': {
      'color': ['1s', 'linear']
    },
    'animationParts': null,
    'styleTuples': [['color', 'var(--primary)']]
  }, {
    'validate': function (p) {
      return !!p["boolAttr"];
    },
    'exportedVariables': {},
    'transitionParts': {},
    'animationParts': null,
    'styleTuples': [['color', 'var(--secondary)']]
  }]
});
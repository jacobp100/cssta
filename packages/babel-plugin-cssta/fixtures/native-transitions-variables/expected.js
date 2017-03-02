import _dynamicComponent from 'cssta/lib/native/dynamicComponent';
import _Transition from 'cssta/lib/native/dynamicComponentEnhancers/Transition';
import _VariablesStyleSheetManager from 'cssta/lib/native/dynamicComponentEnhancers/VariablesStyleSheetManager';

import { Animated } from 'react-native';

_dynamicComponent(Animated.View, ['boolAttr'], [_VariablesStyleSheetManager, _Transition], {
  'transitionedProperties': ['color'],
  'importedVariables': ['primary', 'secondary'],
  'rules': [{
    'validate': function (p) {
      return true;
    },
    'transitions': {
      'color': ['1s', 'linear']
    },
    'exportedVariables': {},
    'animation': null,
    'styleTuples': [['color', 'var(--primary)']]
  }, {
    'validate': function (p) {
      return !!p['boolAttr'];
    },
    'transitions': {},
    'exportedVariables': {},
    'animation': null,
    'styleTuples': [['color', 'var(--secondary)']]
  }],
  'keyframesStyleTuples': {}
});
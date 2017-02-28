import _dynamicComponent from 'cssta/dist/native/dynamicComponent';
import _Transition from 'cssta/dist/native/dynamicComponentEnhancers/Transition';
import _VariablesStyleSheetManager from 'cssta/dist/native/dynamicComponentEnhancers/VariablesStyleSheetManager';

import { Animated } from 'react-native';

_dynamicComponent(Animated.View, ['boolAttr'], [_VariablesStyleSheetManager, _Transition], {
  'rules': [{
    'validate': function (p) {
      return true;
    },
    'transitions': {
      'color': ['1s', 'linear']
    },
    'exportedVariables': {},
    'styleTuples': [['color', 'var(--primary)']]
  }, {
    'validate': function (p) {
      return !!p['boolAttr'];
    },
    'transitions': {},
    'exportedVariables': {},
    'styleTuples': [['color', 'var(--secondary)']]
  }],
  'transitions': ['color'],
  'importedVariables': ['primary', 'secondary']
});
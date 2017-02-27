import _dynamicComponent from 'cssta/dist/native/dynamicComponent';
import _Transition from 'cssta/dist/native/dynamicComponentEnhancers/Transition';
import _VariablesStyleSheetManager from 'cssta/dist/native/dynamicComponentEnhancers/VariablesStyleSheetManager';

import { Animated } from 'react-native';

_dynamicComponent(Animated.View, ['boolAttr'], [_VariablesStyleSheetManager, _Transition], {
  'rules': [{
    'validate': function (p) {
      return true;
    },
    'exportedVariables': {},
    'styleTuples': [['color', 'var(--primary)']],
    'exportedVariables': {}
  }, {
    'validate': function (p) {
      return !!p['boolAttr'];
    },
    'exportedVariables': {},
    'styleTuples': [['color', 'var(--secondary)']],
    'exportedVariables': {}
  }],
  'transitions': ['color'],
  'importedVariables': ['primary', 'secondary']
});
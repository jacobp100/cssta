import _TransitionTransform from 'cssta/dist/native/dynamicComponent/TransitionTransform';
import _VariablesStyleSheetManager from 'cssta/dist/native/dynamicComponent/VariablesStyleSheetManager';
import _combineManagers from 'cssta/dist/native/dynamicComponent/combineManagers';

import { Animated } from 'react-native';

_combineManagers(_VariablesStyleSheetManager, [_TransitionTransform])(Animated.View, ['boolAttr'], {
  'transitions': ['color'],
  'importedVariables': ['primary', 'secondary']
}, [{
  'validate': function (p) {
    return true;
  },
  'styleTuples': [['color', 'var(--primary)']],
  'transitions': {
    'color': ['1s', 'linear']
  },
  'exportedVariables': {}
}, {
  'validate': function (p) {
    return !!p['boolAttr'];
  },
  'styleTuples': [['color', 'var(--secondary)']],
  'transitions': {},
  'exportedVariables': {}
}]);
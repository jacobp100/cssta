import _TransitionTransform from 'cssta/dist/native/dynamicComponent/TransitionTransform';
import _StaticStyleSheetManager from 'cssta/dist/native/dynamicComponent/StaticStyleSheetManager';
import _combineManagers from 'cssta/dist/native/dynamicComponent/combineManagers';

import { Animated } from 'react-native';

_combineManagers(_StaticStyleSheetManager, [_TransitionTransform])(Animated.View, ['boolAttr'], {
  'transitions': ['color'],
  'importedVariables': []
}, [{
  'validate': function (p) {
    return true;
  },
  'styleTuples': [['color', 'red']],
  'transitions': {
    'color': ['1s', 'linear']
  },
  'exportedVariables': {}
}, {
  'validate': function (p) {
    return !!p['boolAttr'];
  },
  'styleTuples': [['color', 'blue']],
  'transitions': {},
  'exportedVariables': {}
}]);
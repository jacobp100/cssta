import _TransitionTransform from 'cssta/dist/native/dynamicComponent/TransitionTransform';
import _StaticStyleSheetManager from 'cssta/dist/native/dynamicComponent/StaticStyleSheetManager';
import _combineManagers from 'cssta/dist/native/dynamicComponent/combineManagers';

import { Animated } from 'react-native';

_combineManagers(_StaticStyleSheetManager, [_TransitionTransform])(Animated.View, ['active'], {
  'transitions': ['backgroundColor', 'transform'],
  'importedVariables': []
}, [{
  'validate': function (p) {
    return true;
  },
  'styleTuples': [['backgroundColor', '#e74c3c'], ['height', '20px'], ['marginBottom', '20px'], ['transform', 'scaleX(1) rotate(0deg)']],
  'transitions': {
    'backgroundColor': ['0.5s', 'linear'],
    'transform': ['0.75s', 'linear']
  },
  'exportedVariables': {}
}, {
  'validate': function (p) {
    return !!p['active'];
  },
  'styleTuples': [['backgroundColor', '#1abc9c'], ['transform', 'scaleX(0.5) rotate(6deg)']],
  'transitions': {},
  'exportedVariables': {}
}]);